const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");

// Theo dõi lượt nghe
router.post("/play", authMiddleware, analyticsController.trackPlay);

// Lịch sử nghe
router.get("/history", authMiddleware, analyticsController.getPlayHistory);
router.delete("/history", authMiddleware, analyticsController.clearHistory);

// Bài hát hot và trending
router.get("/hot", analyticsController.getHotSongs);
router.get("/trending", analyticsController.getTrendingSongs);
router.get(
  "/recommendations",
  authMiddleware,
  analyticsController.getRecommendations
);

module.exports = router;

// analyticsRoutes.js
