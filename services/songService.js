const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mm = require("music-metadata");
const { initDB } = require("../core/initDB");

// file db/songs.json thay vì db.json
const dbDir = path.join(__dirname, "..", "db");
const dbFile = path.join(dbDir, "songs.json");
const defaultData = { songs: [] };

let db; // khởi tạo rỗng

// Khởi tạo database
async function initializeDatabase() {
  try {
    const { songsDB } = await initDB();
    db = songsDB;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Helper function để đảm bảo db đã được khởi tạo
async function ensureDB() {
  if (!db) {
    await initializeDatabase();
  }
  await db.read(); // Luôn đọc lại data mới nhất
}

// helper đảm bảo folder tồn tại
function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// helper để làm sạch tên file (bỏ ký tự đặc biệt, khoảng trắng thành _)
function sanitizeFileName(name) {
  let clean = name.trim().replace(/\s+/g, "_");
  clean = clean.replace(/[\\/:*?"<>|]/g, "");
  return clean;
}

exports.uploadSong = async (req) => {
  await ensureDB();
  if (!db) throw new Error("Database not initialized yet");

  const { title, artist, genre } = req.body;
  const audioFile = req.files?.audio;
  const coverFile = req.files?.cover;

  if (!audioFile) throw new Error("Audio file is required");
  if (!genre) throw new Error("Genre is required");
  if (typeof genre !== "string" || genre.trim() === "") {
    throw new Error("Genre must be a non-empty string");
  }

  const songId = uuidv4();
  const safeTitle = sanitizeFileName(title);

  // tạo thư mục nếu chưa có
  const musicDir = path.join(__dirname, "..", "uploads", "music");
  const coversDir = path.join(__dirname, "..", "uploads", "covers");
  ensureDirSync(musicDir);
  ensureDirSync(coversDir);

  const audioExt = path.extname(audioFile.name);
  const coverExt = coverFile ? path.extname(coverFile.name) : null;

  const audioFileName = `${safeTitle}_${songId}${audioExt}`;
  const audioPath = `uploads/music/${audioFileName}`;
  await audioFile.mv(path.join(__dirname, "..", audioPath));

  // cover
  let coverPath = coverFile
    ? `uploads/covers/${safeTitle}_${songId}${coverExt}`
    : "/uploads/covers/default.jpg";
  if (coverFile) await coverFile.mv(path.join(__dirname, "..", coverPath));

  // duration
  let duration = 0;
  try {
    const metadata = await mm.parseFile(path.join(__dirname, "..", audioPath));
    duration = Math.floor(metadata.format.duration);
  } catch (err) {
    console.warn("Cannot read duration:", err.message);
  }

  const newSong = {
    id: songId,
    title,
    artist,
    genre: genre.trim(), // Đảm bảo genre không có khoảng trắng thừa
    audioUrl: audioPath,
    coverUrl: coverPath,
    likeCount: 0,
    duration,
    createdAt: new Date(),
    streamUrl: `${
      process.env.BASE_URL || "http://localhost:3000"
    }/songs/stream/${songId}`,
  };

  db.data.songs.push(newSong);
  await db.write();

  return newSong;
};

exports.getSongs = async (page = 1, limit = 20) => {
  await ensureDB();

  if (!db) throw new Error("Database not initialized yet");

  const songs = db.data.songs
    .map((s) => ({
      ...s,
      coverUrl: s.coverUrl || "/uploads/covers/default.jpg",
      streamUrl: `${
        process.env.BASE_URL || "http://localhost:3000"
      }/songs/stream/${s.id}`,
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = songs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const data = songs.slice(startIndex, endIndex);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: data,
  };
};

exports.getSongById = async (id) => {
  await ensureDB(); // Thêm await ensureDB()

  const s = db.data.songs.find((s) => s.id === id);
  if (!s) return null;

  return {
    ...s,
    coverUrl: s.coverUrl || "/uploads/covers/default.jpg",
    streamUrl: `${
      process.env.BASE_URL || "http://localhost:3000"
    }/songs/stream/${s.id}`,
  };
};

exports.streamSong = async (req, res) => {
  await ensureDB();

  if (!db) throw new Error("Database not initialized yet");

  const song = db.data.songs.find((s) => s.id === req.params.id);
  if (!song) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  // Track lượt nghe (nếu có user đăng nhập)
  if (req.user && req.user.id) {
    const analyticsService = require("./analyticsService");
    analyticsService
      .trackPlay(req.user.id, song.id, song.duration || 0)
      .catch((err) => console.error("Track play error:", err));
  }

  if (!song) throw new Error("Song not found");

  const filePath = path.join(__dirname, "..", song.audioUrl);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) throw new Error("Range not satisfiable");

    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
    });
    file.pipe(res);
  }
};

exports.searchSongs = async (query, page = 1, limit = 20) => {
  await ensureDB();
  if (!db) throw new Error("Database not initialized yet");

  const normalizeVietnamese = (str) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  let filteredSongs = db.data.songs;

  if (query.trim() !== "") {
    const searchTerm = normalizeVietnamese(query.trim());

    filteredSongs = filteredSongs.filter((song) => {
      if (!song.title || !song.artist) return false;
      const title = normalizeVietnamese(song.title);
      const artist = normalizeVietnamese(song.artist);
      return title.includes(searchTerm) || artist.includes(searchTerm);
    });
  }

  const total = filteredSongs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: filteredSongs.slice(startIndex, endIndex),
  };
};

// songService.js
