const fs = require("fs");
const path = require("path");
const userService = require("../services/userService");

// Like/unlike song
exports.likeSong = async (req, res) => {
  try {
    const userId = req.user.id;
    const songId = req.params.id;
    const result = await userService.toggleLikeSong(userId, songId);

    res.json({
      success: true,
      message: "Song like/unlike updated",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy danh sách nhạc đã thích
exports.getLikedSongs = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const likedSongs = await userService.getLikedSongs(userId, page, limit);

    res.json({
      success: true,
      data: likedSongs,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Upload Avatar (xoá avatar cũ)
exports.uploadAvatar = async (req, res) => {
  // THÊM async
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatar = req.files.avatar;
    const userId = req.user.id;

    // Tạo folder avatar nếu chưa có
    const uploadPath = path.join(__dirname, "../uploads/avatar");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Lấy users + user hiện tại - SỬA ĐOẠN NÀY
    const users = await userService.readUsers(); // THÊM await
    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Nếu có avatar cũ thì xoá trước
    if (user.avatar) {
      const oldPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Tên file: userId + đuôi file
    const ext = path.extname(avatar.name);
    const filename = `${userId}${ext}`;
    const filePath = path.join(uploadPath, filename);

    // Lưu file mới
    avatar.mv(filePath, async (err) => {
      // THÊM async
      if (err) return res.status(500).json({ message: "Error saving file" });

      // Cập nhật user - SỬA ĐOẠN NÀY
      user.avatar = `/uploads/avatar/${filename}`;
      try {
        await userService.writeUsers(users); // THÊM await
        res.json({
          message: "Avatar uploaded successfully",
          avatar: user.avatar,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// user Controller
