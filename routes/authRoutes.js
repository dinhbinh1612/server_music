const express = require("express");
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  profile,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// register
router.post("/register", register);

// login
router.post("/login", login);

// google login
router.post("/google-login", googleLogin);

// profile (require login)
router.get("/profile", authMiddleware, profile);

module.exports = router;

// routes/authRoutes.js
