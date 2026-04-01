const mongoose = require("mongoose");

const supplierPerformanceSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    // Percentage of orders delivered on or before expected date (0–100)
    onTimeDeliveryRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    // Percentage of delivered units that had defects (0–100)
    defectRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    // Average number of days to deliver after order placed
    avgDeliveryTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupplierPerformance", supplierPerformanceSchema);
