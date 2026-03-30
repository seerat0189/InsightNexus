const Company = require('../models/Company');
const CompanyUsers = require('../models/CompanyUsers');
const { nanoid } = require('nanoid');

// ─── Internal: Called by auth-service during registration ─────────────────────
// POST /api/internal/company/setup
exports.setupCompany = async (req, res) => {
  try {
    const { action, userId, companyName, industry, companyCode, name, email } = req.body;

    if (!action || !userId) {
      return res.status(400).json({ success: false, message: 'action and userId are required' });
    }

    if (action === 'create') {
      // 1. Create company with a unique 8-char code
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

      // 2. Add user as admin
      await CompanyUsers.create({
        userId,
        companyId: company._id,
        role: 'admin',
        name,
        email,
      });

      return res.status(201).json({ success: true, companyId: company._id, companyCode: code });

    } else if (action === 'join') {
      // 1. Find company by code
      const company = await Company.findOne({ companyCode: companyCode?.toUpperCase() });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Invalid company code. Company not found.' });
      }

      // 2. Check if user is already in this company
      const existing = await CompanyUsers.findOne({ userId, companyId: company._id });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User is already a member of this company.' });
      }

      // 3. Add user as viewer
      await CompanyUsers.create({
        userId,
        companyId: company._id,
        role: 'viewer',
        name,
        email,
      });

      return res.status(200).json({ success: true, companyId: company._id });

    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Must be "create" or "join".' });
    }
  } catch (err) {
    console.error('setupCompany error:', err);
    res.status(500).json({ success: false, message: 'Server error during company setup' });
  }
};

// ─── GET /api/company/me ──────────────────────────────────────────────────────
exports.getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({ success: true, company });
  } catch (err) {
    console.error('getMyCompany error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/company/code ────────────────────────────────────────────────────
// Admin only — returns the company invite code
exports.getCompanyCode = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId).select('companyCode');
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({ success: true, companyCode: company.companyCode });
  } catch (err) {
    console.error('getCompanyCode error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
