const Groq = require('groq-sdk');
const settingsModel = require('../models/settingsModel');
const { initializeScheduledTasks } = require('../utils/cronIngest');
const Article = require('../models/Article');
const InjectionScheduleModel = require('../models/InjectionScheduleModel');
const User = require('../models/User');
const { getRedis } = require('../config/redis');

// The Master Groq instance using your private server key
const masterGroq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * MASTER ANALYZER FUNCTION
 * Uses Groq to "sniff" the API key and return configuration
 */
const analyzeKeyWithAI = async (keyString, type) => {
  if (!keyString) return null;

  const prompt = `
    Analyze this API key: "${keyString}" for ${type} tasks.
  
  IDENTIFICATION RULES:
  - For Cloudflare (contains ":"): 
    1. Set baseUrl to EXACTLY "https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run"
    2. Extract the part before ":" and set it as "accountId".
    3. Extract the part after ":" and set it as "cleanKey".
  - If starts with "gsk_" -> Provider: "Groq", Protocol: "openai", baseUrl: "https://api.groq.com/openai/v1"
  - If starts with "sk-or-" -> Provider: "OpenRouter", Protocol: "openai", baseUrl: "https://openrouter.ai/api/v1"
  - If starts with "sk-" -> Provider: "OpenAI", Protocol: "openai", baseUrl: "https://api.openai.com/v1"

  MODEL SELECTION:
  - Groq Text: "llama-3.3-70b-versatile"
  - OpenRouter Text: "google/gemini-2.0-flash-001"
  - OpenAI Text: "gpt-4o-mini"
  - OpenAI Image: "dall-e-3"
  - Cloudflare Image: "@cf/stabilityai/stable-diffusion-xl-base-1.0"

  Return ONLY JSON:
  {
    "name": "Provider Name",
    "baseUrl": "URL",
    "protocol": "openai|custom",
    "model": "Technical Model ID",
    "accountId": "ID if Cloudflare",
    "cleanKey": "The full token required for the Bearer header",
    "authHeader": "Bearer [cleanKey]",
    "reasoning": "short explanation of detection"
  }
    CATCH-ALL RULE:
    If the key format is unknown:
    1. Assume Provider: "Unknown/OpenAI-Compatible"
    2. Protocol: "openai"
    3. BaseUrl: "https://api.openai.com/v1" (as default)
    4. Model: "gpt-4o-mini"
  `;

  try {
    const chatCompletion = await masterGroq.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const rawContent = chatCompletion.choices[0].message.content;
    console.log(`--- AI ${type.toUpperCase()} RAW RESPONSE ---`);
    console.log(rawContent);

    return JSON.parse(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze credentials");
  }
};

/**
 * GET SETTINGS
 * Retrieves the current site configuration and AI pool
 */
exports.getSettings = async (req, res) => {
  try {
    // We look for the document with our unique key
    const settings = await settingsModel.findOne(
      { key: "model_config" },{ 
        siteTitle: 0, 
        contactEmail: 0, 
        contactPhone: 0, 
        logo: 0, 
        fallbackBannerUrl: 0,
        createdAt: 0,
        updatedAt: 0,
        __v: 0 
      });

    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    // Convert Mongoose document to plain JSON 
    // This ensures 'Maps' (metadata) are converted to standard objects
    const settingsData = settings.toObject();

    res.status(200).json(settingsData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings", error: error.message });
  }
};

/**
 * SYNC SMART KEYS CONTROLLER
 * Triggered by the frontend "Sync Intelligence" button
 */
exports.syncSmartKeys = async (req, res) => {
  const { textKey, imageKey } = req.body;

  try {
    // 1. Analyze keys in parallel
    const [textResult, imageResult] = await Promise.all([
      analyzeKeyWithAI(textKey, 'text'),
      analyzeKeyWithAI(imageKey || textKey, 'image') // Fallback to textKey if imageKey is empty
    ]);

    // 2. Map results to our Schema structure
    const providers = [];
    
    if (textResult) {
      providers.push({
        name: textResult.name,
        baseUrl: textResult.baseUrl,
        apiKey: textResult.cleanKey,
        payloadStructure: textResult.protocol,
        textModel: textResult.model,
        category: 'text',
        metadata: textResult.accountId ? { accountId: textResult.accountId } : {}
      });
    }

    // ... inside syncSmartKeys after getting imageResult ...

if (imageResult) {
  // Logic: Some AI models return accountID, some account_id, some accountId
  const rawId = imageResult.accountId || imageResult.accountID || imageResult.account_id;
  
  // Logic: Ensure we are actually detecting Cloudflare
  const isCf = imageResult.name?.toLowerCase().includes('cloudflare') || 
                       imageResult.baseUrl?.includes('cloudflare');

  const imageProviderData = {
    name: isCf ? "Cloudflare" : (imageResult.name || "Custom Image"),
    baseUrl: isCf 
      ? "https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run" 
      : imageResult.baseUrl,
    apiKey: imageResult.cleanKey || imageResult.apiKey,
    payloadStructure: imageResult.protocol || (isCf ? "custom" : "openai"),
    imageModel: imageResult.model || imageResult.imageModel,
    category: 'image',
    metadata: rawId ? { accountId: String(rawId).trim() } : {} // Plain object
};

  // Explicitly set the key if the ID exists
  if (rawId) {
    imageProviderData.metadata = { accountId: String(rawId).trim() };
  }

  providers.push(imageProviderData);
}

    // 3. Update the centralized settings document
    console.log("FINAL PROVIDERS ARRAY:", JSON.stringify(providers, null, 2));
    const updatedSettings = await settingsModel.findOneAndUpdate(
      { key: "model_config" },
      { 
        $set: { 
          aiProviders: providers,
          activeTextProvider: textResult?.name || "",
          activeImageProvider: imageResult?.name || ""
        } 
      },
      { upsert: true, new: true }
    ).lean();

    res.status(200).json({
      message: "AI Intelligence Synced Successfully",
      activeText: updatedSettings.activeTextProvider,
      activeImage: updatedSettings.activeImageProvider
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error during sync", error: error.message });
  }
};

exports.updateCronSchedule = async (req, res) =>{
  try{
    const { intervalMinutes, articleExpiryDays } = req.body;

    // 1. Validation: Force a minimum of 15 minutes
    const interval = parseInt(intervalMinutes);
    
    if (isNaN(interval) || interval < 15) {
      return res.status(400).json({ 
        success: false, 
        message: "For system stability, the ingestion interval must be at least 15 minutes." 
      });
    }

    // 2. Convert integer (e.g., 30) to Cron String (e.g., "*/30 * * * *")
    // If interval is 60 or more, we might want to use "0 */x" format, 
    // but for simplicity, "*/x" works for most node-cron versions.
    const newCronString = `*/${interval} * * * *`;

    const updatedSettings = await settingsModel.findOneAndUpdate(
      { key: "model_config"},
      { 
        $set: { 
          cronSchedule:newCronString, 
          articleExpiryDays 
        } 
      },
      { new: true, upsert: true}
    );

    try {
      await initializeScheduledTasks();
    } catch (cronError) {
      return res.status(207).json({ // 207 = Multi-Status (Saved but task failed)
        success: true,
        message: "Settings saved, but the background task failed to restart. Please check server logs.",
        data: updatedSettings
      });
    }
    
    res.status(200).json({
      success: true,
      message: `System updated. Next ingestion run scheduled for every ${interval} minutes.`,
      data: {
        interval: interval,
        cronString: updatedSettings.cronSchedule,
        expiryDays: updatedSettings.articleExpiryDays
      }
    });
  }catch(error){
    console.error("Update Settings Error:", error.message);
   res.status(500).json({
      success: false,
      message: "Failed to update settings.",
      error: error.message
    });
  }
}


exports.getSystemAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Execute all database queries in parallel
    const [
      totalUsers, 
      newUsersToday, 
      engagementStats, 
      contentStats, 
      categoryStats, 
      topArticles, // Added correctly here
      activeRules
    ] = await Promise.all([
      // 1. User Totals
      User.countDocuments({ role: "user" }),
      
      // 2. New Users Today
      User.countDocuments({
        role: "user",
        createdAt: { $gte: startOfToday }
      }),

      // 3. Average Engagement
      User.aggregate([
        { $match: { role: "user" } },
        {
          $group: {
            _id: null,
            avgSaved: { $avg: { $size: { $ifNull: ["$savedArticles", []] } } },
            avgLiked: { $avg: { $size: { $ifNull: ["$likedArticles", []] } } }
          }
        }
      ]),

      // 4. Content & Views
      Article.aggregate([
        {
          $group: {
            _id: null,
            totalArticles: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } },
            todayArticles: {
              $sum: { $cond: [{ $gte: ["$createdAt", startOfToday] }, 1, 0] }
            }
          }
        }
      ]),

      // 5. Category Distribution & Ranking
      Article.aggregate([
        { 
          $group: { 
            _id: "$category", 
            articleCount: { $sum: 1 },
            totalViews: { $sum: { $ifNull: ["$views", 0] } } 
          } 
        },
        { $sort: { totalViews: -1 } },
        { $project: { name: "$_id", totalViews: 1, articleCount: 1, _id: 0 } }
      ]),

      // 6. Top 10 Articles
      Article.find({}, { title: 1, views: 1, category: 1 })
        .sort({ views: -1 })
        .limit(10)
        .lean(),

      // 7. Operational Health
      InjectionScheduleModel.find({ status: "active" })
    ]);

    const contentData = contentStats[0] || { totalArticles: 0, totalViews: 0, todayArticles: 0 };

    const contentWeighting = categoryStats.map(cat => ({
      name: cat.name || "Uncategorized",
      value: cat.articleCount,
      percentage: ((cat.articleCount / contentData.totalArticles) * 100).toFixed(1),
      views: cat.totalViews
    }));

    const analyticsResult = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          today: newUsersToday,
          engagement: engagementStats[0] || { avgSaved: 0, avgLiked: 0 }
        },
        content: {
          total: contentData.totalArticles,
          today: contentData.todayArticles,
          totalViews: contentData.totalViews,
          topArticles: topArticles.map(a => ({
            label: a.title.length > 20 ? a.title.substring(0, 20) + "..." : a.title,
            views: a.views || 0,
            category: a.category
          })),
          categoryRanking: categoryStats,
          contentWeighting: contentWeighting
        },
        ingestion: {
          activeRulesCount: activeRules.length,
          rules: activeRules.map(rule => ({
            category: rule.category,
            current: rule.countToday,
            total: rule.articlesPerDay,
            percentage: ((rule.countToday / rule.articlesPerDay) * 100).toFixed(1)
          }))
        }
      }
    };

    res.status(200).json(analyticsResult);

  } catch (error) {
    console.error("Analytics Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};