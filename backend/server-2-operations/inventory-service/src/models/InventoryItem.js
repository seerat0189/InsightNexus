const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: 0,
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

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);