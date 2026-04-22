const User = require('../models/user.model');

// @desc  Get user profile
// @route GET /api/v1/users/profile
const getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

// @desc  Update user profile
// @route PUT /api/v1/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, block, unit, profilePic } = req.body;

    // Residents cannot change email or role (enforced here too)
    const updates = {};
    if (name) updates.name = name;
    if (block !== undefined) updates.block = block;
    if (unit !== undefined) updates.unit = unit;
    if (profilePic !== undefined) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (error) {
    next(error);
  }
};

// @desc  Get all users (admin only)
// @route GET /api/v1/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort('name');
    res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers };