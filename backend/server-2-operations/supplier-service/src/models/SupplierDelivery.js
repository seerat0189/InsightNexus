const mongoose = require("mongoose");

const supplierDeliverySchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    orderDate: {
      type: Date,
      required: true,
    },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    actualDeliveryDate: {
      type: Date,
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
    },
    defectiveItems: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupplierDelivery", supplierDeliverySchema);