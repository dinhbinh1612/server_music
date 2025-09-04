const { initDB } = require("../core/initDB");

let usersDB, songsDB;

async function ensureDBs() {
  if (!usersDB || !songsDB) {
    const dbs = await initDB();
    usersDB = dbs.usersDB;
    songsDB = dbs.songsDB;
  }
  await Promise.all([usersDB.read(), songsDB.read()]);
}

async function readUsers() {
  await ensureDBs();
  return usersDB.data || [];
}

async function writeUsers(users) {
  await ensureDBs();
  usersDB.data = users;
  return usersDB.write();
}

async function readSongs() {
  await ensureDBs();
  return songsDB.data.songs || [];
}

// Like/Unlike song
async function toggleLikeSong(userId, songId) {
  const users = await readUsers();
  const songs = await readSongs();

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

  await writeUsers(users);
  songsDB.data.songs = songs;
  await songsDB.write();

  return { likedSongs: user.likedSongs, song };
}

// Lấy danh sách nhạc đã like (có phân trang)
async function getLikedSongs(userId, page = 1, limit = 20) {
  const users = await readUsers();
  const songs = await readSongs();

  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const likedSongs = songs.filter((s) => user.likedSongs?.includes(s.id));

  // Sắp xếp mới nhất trước
  likedSongs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = likedSongs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: likedSongs.slice(startIndex, endIndex),
  };
}

module.exports = {
  toggleLikeSong,
  getLikedSongs,
  readUsers,
  writeUsers,
};

// userService.js