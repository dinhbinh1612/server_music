const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload"); // 👈 import express-fileupload

const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");
const userRoutes = require("./routes/userRoutes");
const playlistRoutes = require("./routes/playlistRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  fileUpload({
    createParentPath: true, // tự tạo folder nếu chưa có
  })
);

// Static folder cho file upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/songs", songRoutes);
app.use("/users", userRoutes);
app.use("/playlists", playlistRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://192.168.1.191:${PORT}`)
);

// server.js