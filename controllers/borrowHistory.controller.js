const BorrowHistory = require("../models/borrowHistory.model");
const Equipment = require("../models/equipment.model");

/**
 * 📌 ดูประวัติทั้งหมด (admin ดูได้ทั้งหมด / staff ดูของตัวเอง)
 */
exports.list = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";

    const filter = isAdmin ? {} : { borrower: req.user.id };

    const history = await BorrowHistory.find(filter)
      .populate("equipment", "itemName category")
      .populate("borrower", "username displayName")
      .sort({ createdAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};

/**
 * 📌 ดูประวัติของอุปกรณ์ตัวเดียว
 */
exports.listByEquipment = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    const history = await BorrowHistory.find({ equipment: equipmentId })
      .populate("borrower", "username displayName")
      .sort({ borrowedAt: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};
