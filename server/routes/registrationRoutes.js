/**
 * @fileoverview Registration routes.
 * Defines routes for event registration, cancellation, listing, and export.
 * @module routes/registrationRoutes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  exportParticipants,
} = require('../controllers/registrationController');

/**
 * @route   POST /api/registrations
 * @desc    Register for an event
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
  ],
  validate,
  registerForEvent
);

/**
 * @route   GET /api/registrations/my
 * @desc    Get current user's registrations
 * @access  Private (Student)
 */
router.get(
  '/my',
  protect,
  authorize('student'),
  getMyRegistrations
);

/**
 * @route   GET /api/registrations/event/:eventId
 * @desc    Get all registrations for an event
 * @access  Private (Organizer, Admin)
 */
router.get(
  '/event/:eventId',
  protect,
  authorize('organizer', 'admin'),
  getEventRegistrations
);

/**
 * @route   DELETE /api/registrations/:id
 * @desc    Cancel a registration
 * @access  Private (Student)
 */
router.delete(
  '/:id',
  protect,
  authorize('student'),
  cancelRegistration
);

/**
 * @route   GET /api/registrations/export/:eventId
 * @desc    Export event participants as CSV
 * @access  Private (Organizer, Admin)
 */
router.get(
  '/export/:eventId',
  protect,
  authorize('organizer', 'admin'),
  exportParticipants
);

module.exports = router;
