const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const USERS_FILE = path.join(__dirname, "../db/users.json");
const PLAYLISTS_FILE = path.join(__dirname, "../db/playlist.json");
const SONGS_FILE = path.join(__dirname, "../db/song.json");

// ======= Helper =======
function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readPlaylists() {
  if (!fs.existsSync(PLAYLISTS_FILE))
    fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(PLAYLISTS_FILE));
}

function writePlaylists(playlists) {
  fs.writeFileSync(PLAYLISTS_FILE, JSON.stringify(playlists, null, 2));
}

function readSongs() {
  return JSON.parse(fs.readFileSync(SONGS_FILE));
}

// ======= Service =======
module.exports = {
  createPlaylist: (userId, name) => {
    const users = readUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error("User not found");

    const playlists = readPlaylists();

    const newPlaylist = {
      id: uuidv4(),
      name,
      userId, // liên kết với user
      songs: [],
      createdAt: new Date(),
    };

    playlists.push(newPlaylist);
    writePlaylists(playlists);

    return newPlaylist;
  },

  getUserPlaylists: (userId) => {
    const playlists = readPlaylists();
    return playlists.filter((p) => p.userId === userId);
  },

  addSongToPlaylist: (userId, playlistId, songId) => {
    const playlists = readPlaylists();
    const songsData = readSongs(); // lấy ra object
    const songs = songsData.songs; // lấy mảng thực sự

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    const song = songs.find((s) => s.id === songId);
    if (!song) throw new Error("Song not found");

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      writePlaylists(playlists);
    }

    return playlist;
  },

  removeSongFromPlaylist: (userId, playlistId, songId) => {
    const playlists = readPlaylists();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    playlist.songs = playlist.songs.filter((id) => id !== songId);
    writePlaylists(playlists);

    return playlist;
  },

  getPlaylistById: (userId, playlistId) => {
    const playlists = readPlaylists();
    const songsData = readSongs();
    const songs = songsData.songs;

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    return {
      ...playlist,
      songs: songs.filter((song) => playlist.songs.includes(song.id)),
    };
  },

  renamePlaylist: (userId, playlistId, newName) => {
    const playlists = readPlaylists();

    const playlist = playlists.find(
      (p) => p.id === playlistId && p.userId === userId
    );
    if (!playlist) throw new Error("Playlist not found");

    playlist.name = newName;
    writePlaylists(playlists);

    return playlist;
  },

  deletePlaylist: (userId, playlistId) => {
    let playlists = readPlaylists();

    playlists = playlists.filter(
      (p) => !(p.id === playlistId && p.userId === userId)
    );
    writePlaylists(playlists);

    return { message: "Playlist deleted successfully" };
  },
};
