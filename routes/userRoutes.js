const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/songs/:id/like", authMiddleware, userController.likeSong);
router.get("/me/liked-songs", authMiddleware, userController.getLikedSongs);

// Upload avatar
router.post("/me/avatar", authMiddleware, userController.uploadAvatar);

module.exports = router;
// User Routes