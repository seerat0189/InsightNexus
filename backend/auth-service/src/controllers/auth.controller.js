const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Session = require('../models/Session');
const { registerSchema, loginSchema } = require('../validators/auth.validators');

// ─── Helper: Sign JWT ──────────────────────────────────────────────────────────
const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Helper: Send token response ──────────────────────────────────────────────
const sendTokenResponse = (res, statusCode, user, token) => {
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  });
};

// ─── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // 1. Validate input
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }

    const { name, email, password, action, companyName, industry, companyCode } = value;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // 3. Determine role based on action
    const role = action === 'create' ? 'admin' : 'viewer';

    // 4. Create user (password hashed via pre-save hook)
    const user = await User.create({ name, email, password, role });

    // 5. Call user-company-service to create or join company
    let companyServicePayload;
    if (action === 'create') {
      companyServicePayload = { action: 'create', userId: user._id, companyName, industry };
    } else {
      companyServicePayload = { action: 'join', userId: user._id, companyCode };
    }

    let companyId;
    try {
      const response = await axios.post(
        `${process.env.USER_COMPANY_SERVICE_URL}/api/internal/company/setup`,
        companyServicePayload
      );
      companyId = response.data.companyId;
    } catch (serviceError) {
      // Rollback: remove the user if company setup fails
      await User.findByIdAndDelete(user._id);
      const message =
        serviceError.response?.data?.message || 'Company setup failed. Please try again.';
      return res.status(serviceError.response?.status || 500).json({ success: false, message });
    }

    // 6. Update user with companyId
    user.companyId = companyId;
    await user.save({ validateBeforeSave: false });

    // 7. Sign JWT
    const token = signToken({ userId: user._id, companyId, role });

    // 8. Save session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await Session.create({ userId: user._id, token, expiresAt });

    sendTokenResponse(res, 201, user, token);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    // 1. Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = value;

    // 2. Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 4. Sign JWT
    const token = signToken({
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
    });

    // 5. Save / refresh session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await Session.findOneAndUpdate(
      { userId: user._id },
      { token, expiresAt },
      { upsert: true, new: true }
    );

    sendTokenResponse(res, 200, user, token);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ─── GET /api/auth/validate ────────────────────────────────────────────────────
// Used by other microservices to validate a token without calling the DB
exports.validateToken = async (req, res) => {
  // req.user is already populated by the protect middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    await Session.findOneAndDelete({ userId: req.user.userId });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};
