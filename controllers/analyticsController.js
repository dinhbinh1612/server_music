const analyticsService = require("../services/analyticsService");
const recommendationService = require("../services/recommendationService");

// Track khi người dùng nghe nhạc
exports.trackPlay = async (req, res) => {
  try {
    const userId = req.user.id;
    const { songId, duration } = req.body;

    const playRecord = await analyticsService.trackPlay(
      userId,
      songId,
      duration
    );

    res.json({
      success: true,
      message: "Play tracked successfully",
      data: playRecord,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử nghe
exports.getPlayHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const history = await analyticsService.getUserPlayHistory(
      userId,
      page,
      limit
    );

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa lịch sử nghe
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    await analyticsService.clearUserHistory(userId);

    res.json({ success: true, message: "Play history cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bài hát hot
exports.getHotSongs = async (req, res) => {
  try {
    const timeRange = req.query.range || "week";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const hotSongs = await recommendationService.getHotSongs(
      timeRange,
      page,
      limit
    );

    res.json({
      success: true,
      data: hotSongs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Bài hát trending
exports.getTrendingSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const trendingSongs = await recommendationService.getTrendingSongs(
      page,
      limit
    );

    res.json({
      success: true,
      data: trendingSongs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đề xuất bài hát
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1; // Thêm page parameter

    const recommendations = await recommendationService.getRecommendations(
      userId,
      limit,
      page // Truyền page parameter
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// analyticsController.js
