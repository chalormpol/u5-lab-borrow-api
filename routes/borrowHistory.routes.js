const router = require("express").Router();
const historyCtrl = require("../controllers/borrowHistory.controller");
const requireRole = require("../middlewares/role.middleware");
const auth = require("../middlewares/auth.middleware");

// ดูประวัติทั้งหมด
router.get("/", auth, requireRole(["admin", "users"]), historyCtrl.list);

// ดูประวัติของอุปกรณ์ตัวเดียว
router.get(
  "/equipment/:equipmentId",
  auth,
  requireRole(["admin", "users"]),
  historyCtrl.listByEquipment,
);

module.exports = router;
