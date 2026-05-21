const Company = require('../models/Company');
const CompanyUsers = require('../models/CompanyUsers');
const { nanoid } = require('nanoid');

exports.setupCompany = async (req, res) => {
  try {
    const { action, userId, name, email, companyName, industry, companyCode } = req.body;

    if (!action || !userId) {
      return res.status(400).json({ success: false, message: 'action and userId are required' });
    }

    if (action === 'create') {
      let code;
      let isUnique = false;

      while (!isUnique) {
        code = nanoid(8).toUpperCase();
        const exists = await Company.findOne({ companyCode: code });
        if (!exists) isUnique = true;
      }

      const company = await Company.create({
        name: companyName,
        industry,
        companyCode: code,
      });

      await CompanyUsers.create({
        userId,
        companyId: company._id,
        role: 'admin',
        name,
        email,
      });

      return res.status(201).json({
        success: true,
        companyId: company._id,
        companyCode: code,
      });

    } else if (action === 'join') {
      const company = await Company.findOne({
        companyCode: companyCode?.toUpperCase(),
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Invalid company code',
        });
      }

      const existing = await CompanyUsers.findOne({
        userId,
        companyId: company._id,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'User already exists in company',
        });
      }

      await CompanyUsers.create({
        userId,
        companyId: company._id,
        role: 'user',
        name,
        email,
      });

      return res.status(200).json({
        success: true,
        companyId: company._id,
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action',
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error during company setup',
    });
  }
};

exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

exports.getCompanyCode = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).select('companyCode');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    res.status(200).json({
      success: true,
      companyCode: company.companyCode,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};