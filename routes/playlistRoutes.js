const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, playlistController.createPlaylist);
router.get("/", authMiddleware, playlistController.getUserPlaylists);
router.get("/:id", authMiddleware, playlistController.getPlaylistById);
router.post("/:id/songs", authMiddleware, playlistController.addSongToPlaylist);
router.delete(
  "/:id/songs/:songId",
  authMiddleware,
  playlistController.removeSongFromPlaylist
);
router.patch("/:id", authMiddleware, playlistController.renamePlaylist);
router.delete("/:id", authMiddleware, playlistController.deletePlaylist);

module.exports = router;
// Playlist Routes