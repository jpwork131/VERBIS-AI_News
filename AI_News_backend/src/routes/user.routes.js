// routes/user.routes.js
const express = require("express");
const router = express.Router();
const { register, login, toggleSaveArticle, getUserInteractions } = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { authLimiter, interactionLimiter } = require("../middleware/rateLimit");

router.post("/register", authLimiter ,register);
router.post("/login", login);

router.post("/save/:articleId", authMiddleware,interactionLimiter, toggleSaveArticle);

router.get("/interactions", authMiddleware, getUserInteractions);


module.exports = router;
