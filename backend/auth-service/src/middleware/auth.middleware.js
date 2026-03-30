const jwt = require('jsonwebtoken');

// ─── Protect: Verify JWT ───────────────────────────────────────────────────────
exports.protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, companyId, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized. Token is invalid or expired.' });
  }
};

// ─── RequireRole: Role-based access control ────────────────────────────────────
// Usage: requireRole('admin') or requireRole('admin', 'manager')
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};
