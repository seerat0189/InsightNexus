const CompanyUsers = require('../models/CompanyUsers');

exports.listMembers = async (req, res) => {
  try {
    const members = await CompanyUsers.find({
      companyId: req.user.companyId,
    }).select('-__v');

    res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'manager', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role',
      });
    }

    const member = await CompanyUsers.findOneAndUpdate(
      {
        userId,
        companyId: req.user.companyId,
      },
      { role },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      member,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove yourself',
      });
    }

    const member = await CompanyUsers.findOneAndDelete({
      userId,
      companyId: req.user.companyId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member removed',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};