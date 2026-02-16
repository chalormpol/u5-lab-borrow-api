const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || "1d" },
  );
}

exports.register = async (req, res) => {
  const { username, displayName, password } = req.body || {};
  if (!username || !displayName || !password) {
    return res.status(400).json({ error: { message: "ข้อมูลไม่ครบ" } });
  }
  const dup = await User.findOne({ username: username.toLowerCase() });
  if (dup)
    return res.status(409).json({ error: { message: "username ถูกใช้แล้ว" } });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.toLowerCase(),
    displayName,
    passwordHash,
    role: "user",
  });

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: { message: "ข้อมูลไม่ครบ" } });

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user)
    return res
      .status(401)
      .json({ error: { message: "username/password ไม่ถูกต้อง" } });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok)
    return res
      .status(401)
      .json({ error: { message: "username/password ไม่ถูกต้อง" } });

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    },
  });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "username displayName role",
  );
  if (!user) return res.status(404).json({ error: { message: "ไม่พบผู้ใช้" } });
  res.json({
    id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  });
};
