const mongoose = require("mongoose");
const Article = require("../models/Article");
const CategoryModel = require("../models/CategoryModel");
const InjectionScheduleModel = require("../models/InjectionScheduleModel");
require("dotenv").config();

const resetAndPrepare = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. DELETE ALL ARTICLES (Clean start)
    const artDelete = await Article.deleteMany({});
    console.log(`🗑️ Deleted ${artDelete.deletedCount} articles.`);

    // 2. RESET INJECTION COUNTERS
    // This allows the cron to start fetching from zero today
    await InjectionScheduleModel.updateMany({}, { countToday: 0 });
    console.log("🔄 Reset daily injection counters to 0.");

    // 3. VERIFY CATEGORIES
    const categories = await CategoryModel.find();
    console.log(`✅ System ready with ${categories.length} active categories.`);
    
    console.log("\n--- DATABASE CLEANED ---");
    console.log("You can now run 'node src/services/ingestion.service.js' (or your cron task) to test the new logic.");
    
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err.message);
    process.exit(1);
  }
};

resetAndPrepare();