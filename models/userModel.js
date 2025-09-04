const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../db/users.json");

// đọc file JSON
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}
// ghi file JSON
function writeUsers(users) {
  try {
    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data");
  }
}

// tìm user theo email
function findUserByEmail(email) {
  const users = readUsers();
  return users.find((u) => u.email === email);
}

// tìm user theo id
function findUserById(id) {
  const users = readUsers();
  return users.find((u) => u.id === id);
}

// thêm user mới
function addUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
}

module.exports = {
  readUsers,
  writeUsers,
  findUserByEmail,
  findUserById,
  addUser,
};

// User Model
