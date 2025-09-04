const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const { initDB } = require("./core/initDB");

const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");
const userRoutes = require("./routes/userRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.191:3000",
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    ],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 20 * 1024 * 1024, // 2MB max file(s) size
    },
    abortOnLimit: true,
    limitHandler: (req, res) => {
      res.status(413).json({
        success: false,
        message: "File too large",
      });
    },
  })
);
app.use(morgan("combined"));

const swaggerUi = require("swagger-ui-express");
const specs = require("./core/swagger");

// Static folder cho file upload
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/songs", songRoutes);
app.use("/users", userRoutes);
app.use("/playlists", playlistRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/analytics", analyticsRoutes);

// app.get("/debug/config", (req, res) => {
//   const { JWT_SECRET, GOOGLE_CLIENT_ID } = require("./core/config");
//   res.json({
//     jwtSecret: JWT_SECRET,
//     jwtSecretLength: JWT_SECRET ? JWT_SECRET.length : 0,
//     googleClientId: GOOGLE_CLIENT_ID,
//     envJWTSecret: process.env.JWT_SECRET,
//     envGoogleClientId: process.env.GOOGLE_CLIENT_ID,
//   });
// });

// Start server
async function startServer() {
  try {
    await initDB();
    console.log("Database initialized successfully");

    // Start server
    const PORT = 3000;
    app.listen(PORT, () =>
      console.log(
        `Server running on ${process.env.BASE_URL || "http://localhost:3000"}`
      )
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// server.js
