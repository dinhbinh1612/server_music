const songService = require("../services/songService");

exports.uploadSong = async (req, res) => {
  try {
    const result = await songService.uploadSong(req);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await songService.getSongs(page, limit);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getSongById = async (req, res) => {
  try {
    const song = await songService.getSongById(req.params.id);
    if (!song) return res.status(404).json({ error: "Song not found" });
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.streamSong = async (req, res) => {
  try {
    await songService.streamSong(req, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// songController.js