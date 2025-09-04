const { initDB } = require("../core/initDB");

let analyticsDB;
let songsDB;

async function ensureDBs() {
  if (!analyticsDB || !songsDB) {
    const dbs = await initDB();
    analyticsDB = dbs.analyticsDB;
    songsDB = dbs.songsDB;
  }
  await Promise.all([analyticsDB.read(), songsDB.read()]);
}

exports.trackPlay = async (userId, songId, duration = 0) => {
  await ensureDBs();

  const existingIndex = analyticsDB.data.playHistory.findIndex(
    (r) => r.userId === userId && r.songId === songId
  );

  const now = new Date().toISOString();
  const timestamp = Date.now();

  if (existingIndex !== -1) {
    analyticsDB.data.playHistory[existingIndex].playedAt = now;
    analyticsDB.data.playHistory[existingIndex].timestamp = timestamp;
    analyticsDB.data.playHistory[existingIndex].duration = duration;
  } else {
    analyticsDB.data.playHistory.push({
      userId,
      songId,
      playedAt: now,
      duration,
      timestamp,
    });
  }

  // Cập nhật tổng lượt nghe bài hát
  const song = songsDB.data.songs.find((s) => s.id === songId);
  if (song) {
    song.playCount = (song.playCount || 0) + 1;
    song.lastPlayed = now;
    await songsDB.write();
  }

  await analyticsDB.write();

  return { userId, songId, playedAt: now, duration, timestamp };
};

exports.getUserPlayHistory = async (userId, page = 1, limit = 20) => {
  await ensureDBs();

  const allHistory = analyticsDB.data.playHistory
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const songs = songsDB.data.songs;

  // map song info vào history
  const historyWithSongs = allHistory.map((h) => {
    const song = songs.find((s) => s.id === h.songId);
    return {
      ...h,
      song: song
        ? {
            id: song.id,
            title: song.title,
            artist: song.artist,
            coverUrl: song.coverUrl || "/uploads/covers/default.jpg",
            audioUrl: song.audioUrl,
            streamUrl: song.streamUrl,
          }
        : null,
    };
  });

  const total = historyWithSongs.length;
  const start = (page - 1) * limit;
  const end = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    history: historyWithSongs.slice(start, end),
  };
};

exports.clearUserHistory = async (userId) => {
  await ensureDBs();
  analyticsDB.data.playHistory = analyticsDB.data.playHistory.filter(
    (r) => r.userId !== userId
  );
  await analyticsDB.write();
};

// analyticsService.js
