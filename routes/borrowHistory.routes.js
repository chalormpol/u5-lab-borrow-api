const router = require("express").Router();
const historyCtrl = require("../controllers/borrowHistory.controller");
const requireRole = require("../middlewares/role.middleware");
const auth = require("../middlewares/auth.middleware");

// ดูประวัติทั้งหมด
router.get("/", auth, requireRole(["admin", "user"]), historyCtrl.list);

// ดูประวัติของอุปกรณ์ตัวเดียว
router.get(
  "/equipment/:equipmentId",
  auth,
  requireRole(["admin", "user"]),
  historyCtrl.listByEquipment,
);

module.exports = router;
