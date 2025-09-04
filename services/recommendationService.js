const { initDB } = require("../core/initDB");

let analyticsDB, songsDB;

async function ensureDBs() {
  if (!analyticsDB || !songsDB) {
    const dbs = await initDB();
    analyticsDB = dbs.analyticsDB;
    songsDB = dbs.songsDB;
  }
  await Promise.all([analyticsDB.read(), songsDB.read()]);
}

async function getHotSongs(timeRange = "week", page = 1, limit = 20) {
  await ensureDBs();

  const now = Date.now();
  let timeFilter;
  switch (timeRange) {
    case "day":
      timeFilter = now - 24 * 60 * 60 * 1000;
      break;
    case "week":
      timeFilter = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case "month":
      timeFilter = now - 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      timeFilter = 0;
  }

  const recentPlays = analyticsDB.data.playHistory.filter(
    (record) => record.timestamp >= timeFilter
  );

  const playCounts = {};
  recentPlays.forEach((record) => {
    playCounts[record.songId] = (playCounts[record.songId] || 0) + 1;
  });

  const allSongs = songsDB.data.songs
    .map((song) => ({
      ...song,
      recentPlayCount: playCounts[song.id] || 0,
    }))
    .sort((a, b) => b.recentPlayCount - a.recentPlayCount);

  const total = allSongs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: allSongs.slice(startIndex, endIndex),
  };
}

// Đề xuất bài hát dựa trên lịch sử nghe
exports.getRecommendations = async (userId, limit = 20, page = 1) => {
  await ensureDBs();

  // Lấy lịch sử nghe gần đây
  const userHistory = analyticsDB.data.playHistory
    .filter((record) => record.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp); // sắp xếp mới nhất trước

  // Nếu chưa có lịch sử nghe, trả về bài hot nhưng sắp xếp random
  if (userHistory.length === 0) {
    const allSongs = [...songsDB.data.songs];
    // shuffle để random
    for (let i = allSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
    }

    const total = allSongs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      songs: allSongs.slice(startIndex, endIndex),
    };
  }

  // Đếm số lần nghe từng bài
  const playCountMap = {};
  userHistory.forEach((record) => {
    playCountMap[record.songId] = (playCountMap[record.songId] || 0) + 1;
  });

  // Lấy danh sách bài đã nghe
  const playedSongIds = new Set(userHistory.map((r) => r.songId));

  // Lọc bài chưa nghe hoặc muốn hiện cả đã nghe (tùy nhu cầu)
  const allSongs = songsDB.data.songs.map((song) => ({
    ...song,
    userPlayCount: playCountMap[song.id] || 0,
    lastPlayed: userHistory.find((r) => r.songId === song.id)?.timestamp || 0,
  }));

  // Sắp xếp ưu tiên:
  // 1. Bài nghe nhiều của user lên đầu
  // 2. Nếu bằng nhau, mới nghe gần đây hơn lên trước
  // 3. Nếu không có lượt nghe, random
  allSongs.sort((a, b) => {
    if (b.userPlayCount !== a.userPlayCount)
      return b.userPlayCount - a.userPlayCount;
    if (b.lastPlayed !== a.lastPlayed) return b.lastPlayed - a.lastPlayed;
    return Math.random() - 0.5; // random nếu vẫn bằng nhau
  });

  const total = allSongs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: allSongs.slice(startIndex, endIndex),
  };
};

// Bài hát hot theo thời gian
exports.getHotSongs = getHotSongs;

// Bài hát thịnh hành (kết hợp lượt nghe và thời gian)
exports.getTrendingSongs = async (page = 1, limit = 20) => {
  await ensureDBs();

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recentPlays = analyticsDB.data.playHistory.filter(
    (record) => record.timestamp >= oneWeekAgo
  );

  const playCounts = {};
  recentPlays.forEach((record) => {
    playCounts[record.songId] = (playCounts[record.songId] || 0) + 1;
  });

  const allSongs = songsDB.data.songs
    .map((song) => {
      const recentScore = playCounts[song.id] || 0;
      const totalScore = song.playCount || 0;
      const timeScore = song.lastPlayed
        ? (now - new Date(song.lastPlayed).getTime()) / (24 * 60 * 60 * 1000)
        : 100;

      const trendingScore =
        recentScore * 2 + totalScore * 0.5 + (100 - Math.min(timeScore, 100));

      return {
        ...song,
        trendingScore,
        recentPlayCount: recentScore,
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore);

  const total = allSongs.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    songs: allSongs.slice(startIndex, endIndex),
  };
};

// recommendationService.js
