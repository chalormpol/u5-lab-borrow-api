const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");

router.get("/", auth, requireRole(["admin"]), ctrl.list);

module.exports = router;
