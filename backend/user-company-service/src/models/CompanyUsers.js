const mongoose = require('mongoose');

const companyUsersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'viewer'],
      default: 'viewer',
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only be in a company once
companyUsersSchema.index({ userId: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('CompanyUsers', companyUsersSchema);
