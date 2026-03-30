const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  getMyCompany,
  getCompanyCode,
  setupCompany,
} = require('../controllers/company.controller');
const {
  listMembers,
  updateMemberRole,
  removeMember,
} = require('../controllers/member.controller');

// ─── Internal route (called by auth-service only, no JWT needed) ───────────────
router.post('/api/internal/company/setup', setupCompany);

// ─── Company routes (JWT required) ────────────────────────────────────────────
router.get('/api/company/me', protect, getMyCompany);
router.get('/api/company/code', protect, requireRole('admin'), getCompanyCode);

// ─── Member management routes ─────────────────────────────────────────────────
router.get('/api/company/members', protect, requireRole('admin', 'manager'), listMembers);
router.patch('/api/company/members/:userId/role', protect, requireRole('admin'), updateMemberRole);
router.delete('/api/company/members/:userId', protect, requireRole('admin'), removeMember);

module.exports = router;

