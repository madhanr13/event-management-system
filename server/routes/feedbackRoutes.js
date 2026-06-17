/**
 * @fileoverview Feedback routes.
 * Defines routes for feedback submission, retrieval, and statistics.
 * @module routes/feedbackRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  submitFeedback,
  getEventFeedback,
  getEventFeedbackStats,
} = require('../controllers/feedbackController');

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback for an event
 * @access  Private (Student)
 */
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('eventId')
      .notEmpty()
      .withMessage('Event ID is required')
      .isMongoId()
      .withMessage('Invalid event ID format'),
    body('rating')
      .notEmpty()
      .withMessage('Rating is required')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Comment cannot exceed 2000 characters'),
  ],
  validate,
  submitFeedback
);

/**
 * @route   GET /api/feedback/event/:eventId
 * @desc    Get all feedback for an event
 * @access  Private (Organizer, Admin)
 */
router.get(
  '/event/:eventId',
  protect,
  authorize('organizer', 'admin'),
  getEventFeedback
);

/**
 * @route   GET /api/feedback/event/:eventId/stats
 * @desc    Get feedback statistics for an event
 * @access  Private (Organizer, Admin)
 */
router.get(
  '/event/:eventId/stats',
  protect,
  authorize('organizer', 'admin'),
  getEventFeedbackStats
);

module.exports = router;
