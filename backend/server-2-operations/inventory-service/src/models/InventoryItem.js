const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "General",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: "pcs",
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: 0,
    },
    reorderQuantity: {
      type: Number,
      default: 10,
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