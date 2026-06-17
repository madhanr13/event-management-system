/**
 * @fileoverview Event routes.
 * Defines routes for event CRUD operations with file upload support.
 * @module routes/eventRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

/**
 * @route   GET /api/events
 * @desc    Get all events (with pagination, search, filter)
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by ID
 * @access  Public
 */
router.get('/:id', getEvent);

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Organizer, Admin)
 */
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  upload.single('poster'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Event title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Event description is required'),
    body('category')
      .notEmpty()
      .withMessage('Event category is required')
      .isIn(['workshop', 'seminar', 'hackathon', 'cultural', 'sports', 'tech', 'other'])
      .withMessage('Invalid event category'),
    body('venue')
      .trim()
      .notEmpty()
      .withMessage('Event venue is required'),
    body('date')
      .notEmpty()
      .withMessage('Event date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('time')
      .trim()
      .notEmpty()
      .withMessage('Event time is required'),
    body('registrationDeadline')
      .notEmpty()
      .withMessage('Registration deadline is required')
      .isISO8601()
      .withMessage('Invalid deadline date format'),
    body('maxParticipants')
      .notEmpty()
      .withMessage('Maximum participants is required')
      .isInt({ min: 1 })
      .withMessage('Maximum participants must be at least 1'),
  ],
  validate,
  createEvent
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Organizer who created, Admin)
 */
router.put(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  upload.single('poster'),
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('category')
      .optional()
      .isIn(['workshop', 'seminar', 'hackathon', 'cultural', 'sports', 'tech', 'other'])
      .withMessage('Invalid event category'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format'),
    body('registrationDeadline')
      .optional()
      .isISO8601()
      .withMessage('Invalid deadline date format'),
    body('maxParticipants')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Maximum participants must be at least 1'),
  ],
  validate,
  updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Organizer who created, Admin)
 */
router.delete(
  '/:id',
  protect,
  authorize('organizer', 'admin'),
  deleteEvent
);

module.exports = router;
