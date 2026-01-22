const mongoose = require("mongoose");
const equipmentSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Computer", "Network", "Electronics", "Other"],
      required: true,
    },
    qty: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["available", "borrowed"],
      default: "available",
    },
    borrowerName: { type: String, default: "" },
    borrowedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    borrowedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Equipment", equipmentSchema);
