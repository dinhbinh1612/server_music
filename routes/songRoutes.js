const express = require("express");
const router = express.Router();
const songController = require("../controllers/songController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/search", songController.searchSongs);
router.get("/", songController.getSongs);
router.get("/:id", songController.getSongById);
router.get("/stream/:id", songController.streamSong);
router.post("/upload", authMiddleware, songController.uploadSong);

module.exports = router;

// songRoutes.js
