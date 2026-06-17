/**
 * @fileoverview User controller.
 * Handles user profile retrieval and updates.
 * @module controllers/userController
 */

const User = require('../models/User');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/profile
 * @access  Private
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetProfile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/users/profile
 * @access  Private
 * @param   {import('express').Request} req - Express request (body: name, department, phone)
 * @param   {import('express').Response} res - Express response
 */
const updateProfile = async (req, res) => {
  try {
    // Only allow updating specific fields (not email or role)
    const allowedFields = {
      name: req.body.name,
      department: req.body.department,
      phone: req.body.phone,
    };

    // Remove undefined fields to avoid overwriting with null
    Object.keys(allowedFields).forEach(
      (key) => allowedFields[key] === undefined && delete allowedFields[key]
    );

    if (Object.keys(allowedFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, allowedFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
