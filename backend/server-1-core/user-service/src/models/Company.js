const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },
    companyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      length: 8,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
