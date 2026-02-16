const Equipment = require("../models/equipment.model");
const BorrowHistory = require("../models/borrowHistory.model");
exports.list = async (_req, res) => {
  const items = await Equipment.find().sort({ createdAt: -1 }).lean();
  res.json(items);
};
// admin เท่านั้น
exports.create = async (req, res) => {
  const { itemName, category, qty } = req.body || {};
  if (!itemName || !category || !qty)
    return res.status(400).json({ error: { message: "ข้อมูลไม่ครบ" } });
  const item = await Equipment.create({ itemName, category, qty: Number(qty) });
  res.status(201).json(item);
};
// admin เท่านั้น
exports.update = async (req, res) => {
  const { id } = req.params;
  const { itemName, category, qty } = req.body || {};
  const updated = await Equipment.findByIdAndUpdate(
    id,
    { itemName, category, qty: Number(qty) },
    { new: true },
  );
  if (!updated)
    return res.status(404).json({ error: { message: "ไม่พบรายการ" } });
  res.json(updated);
};

// admin เท่านั้น
exports.remove = async (req, res) => {
  const { id } = req.params;
  const deleted = await Equipment.findByIdAndDelete(id);
  if (!deleted)
    return res.status(404).json({ error: { message: "ไม่พบรายการ" } });
  res.json({ ok: true });
};
// user/admin ยืมได้
exports.borrow = async (req, res) => {
  const { id } = req.params;
  const borrowerName = String(req.body?.borrowerName || "").trim();
  if (borrowerName.length < 2)
    return res.status(400).json({ error: { message: "กรุณาระบุชื่อผู้ยืม" } });
  const updated = await Equipment.findOneAndUpdate(
    { _id: id, status: "available" },
    {
      status: "borrowed",
      borrowerName,
      borrowedBy: req.user.id,
      borrowedAt: new Date(),
    },
    { new: true },
  );
  if (!updated)
    return res
      .status(400)
      .json({ error: { message: "รายการนี้ถูกยืมไปแล้ว หรือไม่พบรายการ" } });

  const borrowDays = 7;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + borrowDays);

  // 🔥 เพิ่มตรงนี้
  await BorrowHistory.create({
    equipment: updated._id,
    borrower: req.user.id,
    borrowerName,
    borrowedAt: new Date(),
    dueDate,
    status: "borrowed",
  });

  res.json(updated);
};

// คืน: admin คืนได้ทุกอัน / user คืนได้เฉพาะของตัวเอง
exports.returnEquip = async (req, res) => {
  const { id } = req.params;
  const FINE_PER_DAY = 10;

  const item = await Equipment.findById(id);
  if (!item) return res.status(404).json({ error: { message: "ไม่พบรายการ" } });

  if (item.status === "available")
    return res
      .status(400)
      .json({ error: { message: "รายการนี้ยังไม่ถูกยืม" } });

  const isAdmin = req.user.role === "admin";
  const isOwner = item.borrowedBy?.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    return res
      .status(403)
      .json({ error: { message: "คุณคืนได้เฉพาะรายการที่คุณยืม" } });
  }

  // 🔥 หา history ที่ยังไม่คืน
  const history = await BorrowHistory.findOne({
    equipment: item._id,
    status: "borrowed",
  });

  if (!history) {
    return res.status(400).json({ error: { message: "ไม่พบประวัติการยืม" } });
  }

  const now = new Date();
  let overdueDays = 0;
  let fineAmount = 0;

  // เช็คเกินกำหนด
  if (now > history.dueDate) {
    const diffTime = now - history.dueDate;
    overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    fineAmount = overdueDays * FINE_PER_DAY;
  }

  // อัปเดต history
  history.returnedAt = now;
  history.overdueDays = overdueDays;
  history.fineAmount = fineAmount;
  history.status = "returned";

  await history.save();

  // รีเซ็ต equipment
  item.status = "available";
  item.borrowerName = "";
  item.borrowedBy = null;
  item.borrowedAt = null;
  await item.save();

  res.json({
    item,
    overdueDays,
    fineAmount,
  });
};
