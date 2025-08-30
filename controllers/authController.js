// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const {
  findUserByEmail,
  findUserById,
  addUser,
} = require("../models/userModel");

const JWT_SECRET = "your_jwt_secret"; // TODO: để trong .env
const googleClient = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

// Register
async function register(req, res) {
  try {
    const { email, password, username, gender, birthdate } = req.body;

    if (findUserByEmail(email)) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      email,
      username,
      gender: gender || null,
      birthdate: birthdate || null,
      password: hashedPassword,
      likedSongs: [],
    };

    addUser(newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
}

// Google Login
async function googleLogin(req, res) {
  try {
    const { tokenId } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: "YOUR_GOOGLE_CLIENT_ID",
    });

    const payload = ticket.getPayload();
    let user = findUserByEmail(payload.email);

    if (!user) {
      user = {
        id: uuidv4(),
        email: payload.email,
        username: payload.name,
        password: null,
        gender: null,
        birthdate: null,
        likedSongs: [],
      };
      addUser(user);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
}

// Profile
function profile(req, res) {
  try {
    const user = findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      gender: user.gender,
      birthdate: user.birthdate,
      avatar: user.avatar || "/uploads/avatar/default.jpg", // fallback nếu chưa có ảnh
      likedSongs: user.likedSongs || [],
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
}

module.exports = {
  register,
  login,
  googleLogin,
  profile,
};
// authController.js
