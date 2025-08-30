const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../db/users.json");
const SONGS_FILE = path.join(__dirname, "../db/song.json");

// --- Users ---
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// --- Songs ---
function readSongs() {
  if (!fs.existsSync(SONGS_FILE)) return { songs: [] };
  return JSON.parse(fs.readFileSync(SONGS_FILE));
}

function writeSongs(songs) {
  fs.writeFileSync(SONGS_FILE, JSON.stringify({ songs }, null, 2));
}

module.exports = {
  // Xuất luôn ra để controller xài
  readUsers,
  writeUsers,

  // Like/unlike song
  toggleLikeSong: (userId, songId) => {
    const users = readUsers();
    const songsData = readSongs();
    const songs = songsData.songs;

    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    if (!user.likedSongs) user.likedSongs = [];

    const song = songs.find((s) => s.id === songId);
    if (!song) throw new Error("Song not found");

    const index = user.likedSongs.indexOf(songId);
    if (index === -1) {
      user.likedSongs.push(songId);
      song.likeCount = (song.likeCount || 0) + 1;
    } else {
      user.likedSongs.splice(index, 1);
      song.likeCount = Math.max(0, (song.likeCount || 1) - 1);
    }

    writeUsers(users);
    writeSongs(songs);

    return { likedSongs: user.likedSongs, song };
  },

  getLikedSongs: (userId) => {
    const users = readUsers();
    const songsData = readSongs();
    const songs = songsData.songs;

    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    return songs.filter((song) => user.likedSongs?.includes(song.id));
  },
};

// User Service
