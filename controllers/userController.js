const fs = require("fs");
const path = require("path");
const userService = require("../services/userService");

// Like/Unlike Song
exports.likeSong = (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = userService.toggleLikeSong(userId, id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get liked songs
exports.getLikedSongs = (req, res) => {
  try {
    const userId = req.user.id;
    const likedSongs = userService.getLikedSongs(userId);
    res.json(likedSongs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Upload Avatar (có xoá avatar cũ)
exports.uploadAvatar = (req, res) => {
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

    // Lấy users + user hiện tại
    const users = userService.readUsers();
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
    avatar.mv(filePath, (err) => {
      if (err) return res.status(500).json({ message: "Error saving file" });

      // Cập nhật user
      user.avatar = `/uploads/avatar/${filename}`;
      userService.writeUsers(users);

      res.json({ message: "Avatar uploaded successfully", avatar: user.avatar });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// user Controller