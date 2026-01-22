const jwt = require("jsonwebtoken");
module.exports = function (req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res
      .status(401)
      .json({ error: { message: "Token invalid/expired" } });
  }
};
