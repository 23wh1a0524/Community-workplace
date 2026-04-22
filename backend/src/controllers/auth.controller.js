const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

// @desc  Register user
// @route POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, block, unit } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required', code: 'MISSING_FIELDS' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    // Only allow admin role if no admins exist yet (first admin bootstrap)
    let assignedRole = 'resident';
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) assignedRole = 'admin'; // First admin
    }

    const user = await User.create({ name, email, password, role: assignedRole, block: block || '', unit: unit || '' });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          block: user.block,
          unit: user.unit,
          communityId: user.communityId,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required', code: 'MISSING_FIELDS' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          block: user.block,
          unit: user.unit,
          communityId: user.communityId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get logged in user
// @route GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

module.exports = { register, login, getMe };