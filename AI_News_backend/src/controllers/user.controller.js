// controllers/user.controller.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });
     const user = await User.create({
      name,
      email,
      password,
      role: role || "user" // default role = user
    });
    res.status(201).json({ message: "User registered" });
  } catch(err) {
    res.status(500).json({ message: "Server error" });
    console.error(err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

     const payload = {
      id: user._id,
      role: user.role,       
      email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name :user.name,} });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleSaveArticle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const articleId = req.params.articleId;
    const isSaved = user.savedArticles.includes(articleId);

    if (isSaved) {
      user.savedArticles.pull(articleId);
    } else {
      user.savedArticles.push(articleId);
    }

    await user.save();

    res.json({
      saved: !isSaved,
      savedArticles: user.savedArticles
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getUserInteractions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('likedArticles savedArticles');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      likedArticleIds: user.likedArticles || [], // Array of IDs
      savedArticleIds: user.savedArticles || []
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching interactions" });
  }
};