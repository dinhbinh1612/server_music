const songService = require("../services/songService");

exports.uploadSong = async (req, res) => {
  try {
    // Validation cơ bản trước khi gọi service
    const { genre } = req.body;
    if (!genre) {
      return res.status(400).json({
        success: false,
        message: "Genre is required",
      });
    }

    const result = await songService.uploadSong(req);
    return res.status(200).json({
      success: true,
      message: "Song uploaded successfully",
      data: result,
    });
  } catch (err) {
    // Phân loại lỗi để trả về status code phù hợp
    if (err.message === "Audio file is required") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err.message === "Genre is required") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};

exports.getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await songService.getSongs(page, limit);
    return res.status(200).json({
      success: true,
      message: "Songs retrieved successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Song retrieved successfully",
      data: song,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.streamSong = async (req, res) => {
  try {
    await songService.streamSong(req, res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.searchSongs = async (req, res) => {
  try {
    const { q = "", page = 1, limit = 20 } = req.query;

    const result = await songService.searchSongs(
      q,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: result.songs.length ? "Search results" : "No songs found",
      data: result,
    });
  } catch (err) {
    console.error("Search error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// songController.js
