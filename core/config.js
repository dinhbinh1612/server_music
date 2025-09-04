require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set in .env file, using fallback secret');
}

module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_123', 
};

// core/config.js