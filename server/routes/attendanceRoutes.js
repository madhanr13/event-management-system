/**
 * @fileoverview Attendance routes.
 * Defines routes for QR-based attendance verification and attendance retrieval.
 * @module routes/attendanceRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  verifyAttendance,
  getEventAttendance,
  getMyAttendance,
} = require('../controllers/attendanceController');

/**
 * @route   POST /api/attendance/verify
 * @desc    Verify attendance using QR token
 * @access  Private (Organizer)
 */
router.post(
  '/verify',
  protect,
  authorize('organizer', 'admin'),
  [
    body('qrToken')
      .notEmpty()
      .withMessage('QR token is required'),
    body('eventId')
      .notEmpty()
      .withMessage('Event ID is required')
      .isMongoId()
      .withMessage('Invalid event ID format'),
  ],
  validate,
  verifyAttendance
);

/**
 * @route   GET /api/attendance/event/:eventId
 * @desc    Get attendance list for an event
 * @access  Private (Organizer, Admin)
 */
router.get(
  '/event/:eventId',
  protect,
  authorize('organizer', 'admin'),
  getEventAttendance
);

/**
 * @route   GET /api/attendance/my
 * @desc    Get current user's attendance records
 * @access  Private (Student)
 */
router.get(
  '/my',
  protect,
  authorize('student'),
  getMyAttendance
);

module.exports = router;
