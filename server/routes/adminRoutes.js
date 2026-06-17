/**
 * @fileoverview Admin routes.
 * Defines routes for admin dashboard, user management, event management, and reports.
 * All routes are admin-only.
 * @module routes/adminRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  getDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  deleteEvent,
  getReports,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and search
 * @access  Private (Admin)
 */
router.get('/users', getUsers);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update a user's role
 * @access  Private (Admin)
 */
router.put(
  '/users/:id/role',
  [
    body('role')
      .notEmpty()
      .withMessage('Role is required')
      .isIn(['admin', 'organizer', 'student'])
      .withMessage('Role must be admin, organizer, or student'),
  ],
  validate,
  updateUserRole
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user and related data
 * @access  Private (Admin)
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   DELETE /api/admin/events/:id
 * @desc    Admin delete any event
 * @access  Private (Admin)
 */
router.delete('/events/:id', deleteEvent);

/**
 * @route   GET /api/admin/reports
 * @desc    Get detailed reports and analytics
 * @access  Private (Admin)
 */
router.get('/reports', getReports);

module.exports = router;
