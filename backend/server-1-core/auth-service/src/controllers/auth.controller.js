const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const Session = require('../models/Session');
const { registerSchema, loginSchema } = require('../validators/auth.validators');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const sendTokenResponse = (res, statusCode, user, token) => {
  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  });
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    console.log("🔥 Register API hit");

    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(e => e.message).join(", "),
      });
    }

    const { name, email, password, action, companyName, industry, companyCode } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: action === 'create' ? 'admin' : 'user'
    });

    let payload;
    if (action === 'create') {
      payload = { action: 'create', userId: user._id, companyName, industry };
    } else {
      payload = { action: 'join', userId: user._id, companyCode };
    }

    let companyId;

    try {
      const response = await axios.post(
        `${process.env.USER_COMPANY_SERVICE_URL}/api/user/internal/company/setup`,
        payload,
        { timeout: 5000 }
      );

      console.log("User service response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "User service failed");
      }

      companyId = response.data.companyId;

      if (!companyId) {
        throw new Error("Company ID missing");
      }

    } catch (err) {
      console.log("User service error:", err.message);

      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    user.companyId = companyId;
    await user.save({ validateBeforeSave: false });

    const token = signToken({
      userId: user._id,
      companyId,
      role: user.role,
    });

    return sendTokenResponse(res, 201, user, token);

  } catch (err) {
    console.log("Register error:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details.map(e => e.message).join(", "),
      });
    }

    const { email, password } = value;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken({
      userId: user._id,
      companyId: user.companyId,
      role: user.role,
    });

    await Session.findOneAndUpdate(
      { userId: user._id },
      { token },
      { upsert: true, new: true }
    );

    return sendTokenResponse(res, 200, user, token);

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// ================= VALIDATE TOKEN =================
exports.validateToken = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  try {
    await Session.findOneAndDelete({ userId: req.user.userId });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};