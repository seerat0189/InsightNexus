const mongoose = require("mongoose");

const costEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["raw_material", "labour", "shipping", "energy", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    product: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CostEntry", costEntrySchema);
