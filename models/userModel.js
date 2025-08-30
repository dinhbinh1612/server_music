const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../db/users.json");

// đọc file JSON
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// ghi file JSON
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
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
