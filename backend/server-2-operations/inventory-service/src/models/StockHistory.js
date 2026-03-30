const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryItem",
      required: true,
      index: true,
    },
    change: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["add", "usage", "adjustment", "defect"],
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockHistory", stockHistorySchema);