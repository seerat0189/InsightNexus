const express = require('express');
const router = express.Router();

const {
  register,
  login,
  validateToken,
  getMe,
  logout,
} = require('../controllers/auth.controller');

const { verifyToken } = require('../../../../shared/middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/validate', verifyToken, validateToken);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

module.exports = router;