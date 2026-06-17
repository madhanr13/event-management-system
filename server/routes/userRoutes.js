/**
 * @fileoverview User routes.
 * Defines routes for user profile retrieval and updates.
 * @module routes/userRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
} = require('../controllers/userController');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('phone')
      .optional()
      .trim(),
    body('department')
      .optional()
      .trim(),
  ],
  validate,
  updateProfile
);

module.exports = router;
