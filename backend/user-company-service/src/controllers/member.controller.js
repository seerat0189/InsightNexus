const CompanyUsers = require('../models/CompanyUsers');

// ─── GET /api/company/members ─────────────────────────────────────────────────
exports.listMembers = async (req, res) => {
  try {
    const members = await CompanyUsers.find({ companyId: req.user.companyId }).select('-__v');
    res.status(200).json({ success: true, count: members.length, members });
  } catch (err) {
    console.error('listMembers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PATCH /api/company/members/:userId/role ──────────────────────────────────
// Admin only — update a member's role
exports.updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin, manager, or viewer.' });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const member = await CompanyUsers.findOneAndUpdate(
      { userId, companyId: req.user.companyId },
      { role },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your company.' });
    }

    res.status(200).json({ success: true, message: 'Role updated successfully.', member });
  } catch (err) {
    console.error('updateMemberRole error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/company/members/:userId ──────────────────────────────────────
// Admin only — remove a member from the company
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from removing themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself from the company.' });
    }

    const member = await CompanyUsers.findOneAndDelete({
      userId,
      companyId: req.user.companyId,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in your company.' });
    }

    res.status(200).json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
