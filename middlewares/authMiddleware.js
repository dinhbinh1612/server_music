const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../core/config"); // Import từ config

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  let token;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    token = authHeader;
  }

  // console.log("Token received:", token);
  // console.log("JWT_SECRET from config:", JWT_SECRET);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("Token decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;

// middleware/authMiddleware.js
