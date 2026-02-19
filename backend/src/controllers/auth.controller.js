const User = require("../models/User");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({
      success: false,
      message: "User already exists",
      code: "USER_EXISTS",
    });

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    token: generateToken(user),
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
      code: "INVALID_CREDENTIALS",
    });

  res.json({
    success: true,
    token: generateToken(user),
  });
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};
