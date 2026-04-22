const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

const getTokenFromHeader = (authorization = '') => {
  const header = authorization.trim();
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  return header.slice(7).trim();
};

const protect = async (req, res, next) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token', code: 'NO_TOKEN' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized', code: 'UNAUTHORIZED' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required', code: 'FORBIDDEN' });
};

module.exports = { protect, adminOnly };