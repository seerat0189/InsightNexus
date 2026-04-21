const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    items: [
      {
        itemId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "ordered", "shipped", "delivered"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    expectedDelivery: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);