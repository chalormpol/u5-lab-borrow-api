const User = require("../models/user.model");

exports.list = async (req, res) => {
  try {
    const users = await User.find()
      .select("username displayName role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
