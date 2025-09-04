const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { initDB } = require("../core/initDB");

const USERS_FILE = path.join(__dirname, "../db/users.json");
const PLAYLISTS_FILE = path.join(__dirname, "../db/playlists.json");
const SONGS_FILE = path.join(__dirname, "../db/songs.json");

let playlistsDB, usersDB, songsDB;

async function initializeDatabases() {
  try {
    const dbs = await initDB();
    playlistsDB = dbs.playlistsDB;
    usersDB = dbs.usersDB;
    songsDB = dbs.songsDB;
  } catch (error) {
    console.error("Failed to initialize databases:", error);
    throw error;
  }
}

async function ensureDBs() {
  if (!playlistsDB || !usersDB || !songsDB) {
    await initializeDatabases();
  }
  await Promise.all([playlistsDB.read(), usersDB.read(), songsDB.read()]);
}

// ======= Helper =======
function readUsers() {
  return usersDB.data || [];
}

function writeUsers(users) {
  usersDB.data = users;
  return usersDB.write();
}

function readPlaylists() {
  return playlistsDB.data || [];
}

function writePlaylists(playlists) {
  playlistsDB.data = playlists;
  return playlistsDB.write();
}

function readSongs() {
  return songsDB.data.songs || [];
}

// ======= Service =======
module.exports = {
  createPlaylist: async (userId, name) => {
    await ensureDBs();

    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    const playlists = readPlaylists();

    // Check for duplicate playlist name for this user
    const duplicate = playlists.find(
      (p) => p.userId === userId && p.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Danh sach phát lại với tên này đã tồn tại");
    }

    const newPlaylist = {
      id: uuidv4(),
      name,
      userId,
      songs: [],
      createdAt: new Date(),
    };

    playlists.push(newPlaylist);
    await writePlaylists(playlists);

    return newPlaylist;
  },

  getUserPlaylists: async (userId) => {
    await ensureDBs();
    const playlists = readPlaylists();
    const songs = readSongs();

    const userPlaylists = playlists.filter((p) => p.userId === userId);

    return userPlaylists.map((playlist) => {
      const playlistSongs = songs.filter((song) =>
        playlist.songs.includes(song.id)
      );
      return {
        ...playlist,
        songs: playlistSongs,
        songCount: playlistSongs.length, //  tổng số bài hát
      };
    });
  },

  createPlaylist: async (userId, name) => {
    await ensureDBs();

    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    const playlists = readPlaylists();

    // Check for duplicate playlist name for this user
    const duplicate = playlists.find(
      (p) => p.userId === userId && p.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      throw new Error("Bạn đã có danh sách phát với tên này");
    }

    const newPlaylist = {
      id: uuidv4(),
      name,
      userId,
      songs: [],
      createdAt: new Date(),
    };

    playlists.push(newPlaylist);
    await writePlaylists(playlists);

    // Return the playlist with empty songs array
    return {
      ...newPlaylist,
      songs: [], // Explicitly include empty songs array
    };
  },

  addSongToPlaylist: async (userId, playlistId, songId) => {
    await ensureDBs();
    const playlists = readPlaylists();
    const songs = readSongs();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    const song = songs.find((s) => s.id === songId);
    if (!song) throw new Error("Song not found");

    // Check if song already exists in playlist
    if (playlist.songs.includes(songId)) {
      throw new Error("Song already exists in this playlist");
    }

    playlist.songs.push(songId);
    await writePlaylists(playlists);

    // Return the playlist with populated song details
    return {
      ...playlist,
      songs: songs.filter((s) => playlist.songs.includes(s.id)),
    };
  },

  removeSongFromPlaylist: async (userId, playlistId, songId) => {
    await ensureDBs();

    const playlists = readPlaylists();
    const songs = readSongs();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    // Check if song exists in playlist
    if (!playlist.songs.includes(songId)) {
      throw new Error("Song not found in this playlist");
    }

    playlist.songs = playlist.songs.filter((id) => id !== songId);
    await writePlaylists(playlists);

    // Return the playlist with updated song details
    return {
      ...playlist,
      songs: songs.filter((s) => playlist.songs.includes(s.id)),
    };
  },

  getPlaylistById: async (userId, playlistId) => {
    await ensureDBs();

    const playlists = readPlaylists();
    const songs = readSongs();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    const playlistSongs = songs.filter((song) =>
      playlist.songs.includes(song.id)
    );

    return {
      ...playlist,
      songs: playlistSongs,
      songCount: playlistSongs.length,
    };
  },

  renamePlaylist: async (userId, playlistId, newName) => {
    await ensureDBs();
    const playlists = readPlaylists();
    const songs = readSongs();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    // Check for duplicate playlist name for this user (excluding current playlist)
    const duplicate = playlists.find(
      (p) =>
        p.userId === userId &&
        p.id !== playlistId &&
        p.name.toLowerCase() === newName.toLowerCase()
    );

    if (duplicate) {
      throw new Error("You already have a playlist with this name");
    }

    playlist.name = newName;
    await writePlaylists(playlists);

    // Return the playlist with song details
    return {
      ...playlist,
      songs: songs.filter((s) => playlist.songs.includes(s.id)),
    };
  },

  deletePlaylist: async (userId, playlistId) => {
    await ensureDBs();
    let playlists = readPlaylists();

    const playlistIndex = playlists.findIndex(
      (p) => p.id === playlistId && p.userId === userId
    );

    if (playlistIndex === -1) {
      throw new Error("Playlist not found");
    }

    playlists.splice(playlistIndex, 1);
    await writePlaylists(playlists);

    return { message: "Playlist deleted successfully" };
  },
};
