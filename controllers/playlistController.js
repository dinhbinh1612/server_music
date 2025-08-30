const playlistService = require("../services/playlistService");

exports.createPlaylist = (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const playlist = playlistService.createPlaylist(userId, name);
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserPlaylists = (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = playlistService.getUserPlaylists(userId);
    res.json(playlists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addSongToPlaylist = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { songId } = req.body;

    const playlist = playlistService.addSongToPlaylist(userId, id, songId);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeSongFromPlaylist = (req, res) => {
  try {
    const userId = req.user.id;
    const { id, songId } = req.params;

    const playlist = playlistService.removeSongFromPlaylist(userId, id, songId);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPlaylistById = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const playlist = playlistService.getPlaylistById(userId, id);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.renamePlaylist = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    const playlist = playlistService.renamePlaylist(userId, id, name);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlaylist = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = playlistService.deletePlaylist(userId, id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Playlist Controller