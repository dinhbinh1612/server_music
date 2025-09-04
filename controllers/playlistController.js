const playlistService = require("../services/playlistService");

exports.createPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = await playlistService.createPlaylist(userId, name.trim());
    res.status(201).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const playlists = await playlistService.getUserPlaylists(userId);
    res.json(playlists);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addSongToPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    const playlist = await playlistService.addSongToPlaylist(userId, id, songId);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, songId } = req.params;

    const playlist = await playlistService.removeSongFromPlaylist(userId, id, songId);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const playlist = await playlistService.getPlaylistById(userId, id);
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.renamePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const playlist = await playlistService.renamePlaylist(userId, id, name.trim());
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await playlistService.deletePlaylist(userId, id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};