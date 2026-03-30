const express = require('express');
const router = express.Router();

const { verifyToken } = require('../../../../shared/middleware/auth.middleware');
const { authorizeRoles } = require('../../../../shared/middleware/role.middleware');

const {
  getMyCompany,
  getCompanyCode,
  setupCompany
} = require('../controllers/company.controller');

const {
  listMembers,
  updateMemberRole,
  removeMember
} = require('../controllers/member.controller');

// Internal route
router.post('/internal/company/setup', setupCompany);

// Company routes
router.get('/company/me', verifyToken, getMyCompany);
router.get('/company/code', verifyToken, authorizeRoles('admin'), getCompanyCode);

// Member routes
router.get('/company/members', verifyToken, authorizeRoles('admin', 'manager'), listMembers);
router.patch('/company/members/:userId/role', verifyToken, authorizeRoles('admin'), updateMemberRole);
router.delete('/company/members/:userId', verifyToken, authorizeRoles('admin'), removeMember);

module.exports = router;