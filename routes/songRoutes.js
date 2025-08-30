const express = require("express");
const router = express.Router();
const songController = require("../controllers/songController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/upload", authMiddleware, songController.uploadSong);
router.get("/", songController.getSongs);
router.get("/:id", songController.getSongById);
router.get("/stream/:id", songController.streamSong);

module.exports = router;
// songRoutes.js