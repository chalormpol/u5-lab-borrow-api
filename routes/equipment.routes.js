const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const requireRole = require("../middlewares/role.middleware");
const ctrl = require("../controllers/equipment.controller");

router.get("/", auth, ctrl.list);
router.post("/", auth, requireRole(["admin"]), ctrl.create);
router.put("/:id", auth, requireRole(["admin"]), ctrl.update);
router.delete("/:id", auth, requireRole(["admin"]), ctrl.remove);
router.post("/:id/borrow", auth, ctrl.borrow);
router.post("/:id/return", auth, ctrl.returnEquip);

module.exports = router;
