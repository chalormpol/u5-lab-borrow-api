const Equipment = require("../models/equipment.model");
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
    { new: true }
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
// staff/admin ยืมได้
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
    { new: true }
  );
  if (!updated)
    return res
      .status(400)
      .json({ error: { message: "รายการนี้ถูกยืมไปแล้ว หรือไม่พบรายการ" } });
  res.json(updated);
};

// คืน: admin คืนได้ทุกอัน / staff คืนได้เฉพาะของตัวเอง
exports.returnEquip = async (req, res) => {
  const { id } = req.params;

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
  item.status = "available";
  item.borrowerName = "";
  item.borrowedBy = null;
  item.borrowedAt = null;
  await item.save();
  res.json(item);
};
