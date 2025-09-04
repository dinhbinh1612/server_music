const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");
const fs = require("fs");

const dbDir = path.join(__dirname, "..", "db");
const songsFile = path.join(dbDir, "songs.json");
const playlistsFile = path.join(dbDir, "playlists.json");
const usersFile = path.join(dbDir, "users.json");
const analyticsFile = path.join(dbDir, "user_activities.json"); 

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function initDB() {
  try {
    ensureDirSync(dbDir);

    // Kiểm tra và tạo file nếu chưa tồn tại
    const files = [songsFile, playlistsFile, usersFile, analyticsFile];
    for (const file of files) {
      if (!fs.existsSync(file)) {
        const defaultContent =
          file === songsFile
            ? '{"songs":[]}'
            : file === analyticsFile
            ? '{"playHistory":[], "userPreferences":{}}'
            : "[]";
        fs.writeFileSync(file, defaultContent);
        console.log(`Created ${file}`);
      }
    }

    // Khởi tạo songs database
    const songsAdapter = new JSONFile(songsFile);
    const songsDB = new Low(songsAdapter, { songs: [] });
    await songsDB.read();
    songsDB.data = songsDB.data || { songs: [] };
    songsDB.data.songs = songsDB.data.songs || [];
    await songsDB.write();

    // Khởi tạo playlists database
    const playlistsAdapter = new JSONFile(playlistsFile);
    const playlistsDB = new Low(playlistsAdapter, []);
    await playlistsDB.read();
    playlistsDB.data = playlistsDB.data || [];
    await playlistsDB.write();

    // Khởi tạo users database
    const usersAdapter = new JSONFile(usersFile);
    const usersDB = new Low(usersAdapter, []);
    await usersDB.read();
    usersDB.data = usersDB.data || [];
    await usersDB.write();

    // Khởi tạo analytics database
    const analyticsAdapter = new JSONFile(analyticsFile);
    const analyticsDB = new Low(analyticsAdapter, {
      playHistory: [],
      userPreferences: {},
    });
    await analyticsDB.read();
    analyticsDB.data = analyticsDB.data || {
      playHistory: [],
      userPreferences: {},
    };
    await analyticsDB.write();

    // console.log("All databases initialized successfully");
    return { songsDB, playlistsDB, usersDB, analyticsDB };
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = { initDB };

// initDB.js
