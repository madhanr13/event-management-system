/**
 * @fileoverview Event model for the College Event Management System.
 * Defines the schema for campus events with categories, capacity tracking,
 * and registration deadline management.
 * @module models/Event
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} EventSchema
 * @property {string} title - Event title (required)
 * @property {string} description - Detailed event description (required)
 * @property {string} category - Event category (required)
 * @property {string} venue - Event venue/location (required)
 * @property {Date} date - Event date (required)
 * @property {string} time - Event time string (required)
 * @property {Date} registrationDeadline - Last date to register (required)
 * @property {number} maxParticipants - Maximum allowed participants (required, min 1)
 * @property {number} currentParticipants - Current registered participant count
 * @property {string} poster - Path/URL to event poster image
 * @property {ObjectId} organizer - Reference to the User who created the event
 * @property {string} status - Event status: upcoming | ongoing | completed | cancelled
 * @property {Date} createdAt - Event creation timestamp
 */
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: ['workshop', 'seminar', 'hackathon', 'cultural', 'sports', 'tech', 'other'],
        message: 'Category must be workshop, seminar, hackathon, cultural, sports, tech, or other',
      },
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    maxParticipants: {
      type: Number,
      required: [true, 'Maximum participants is required'],
      min: [1, 'Maximum participants must be at least 1'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative'],
    },
    poster: {
      type: String,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Event organizer is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        message: 'Status must be upcoming, ongoing, completed, or cancelled',
      },
      default: 'upcoming',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field to check if registration is currently open.
 * Registration is open if:
 *  - The deadline has not passed
 *  - There is still capacity available
 *  - The event is not cancelled
 * @returns {boolean} True if registration is open
 */
EventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    this.registrationDeadline > now &&
    this.currentParticipants < this.maxParticipants &&
    this.status !== 'cancelled'
  );
});

// Indexes for efficient querying
EventSchema.index({ date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1, category: 1, status: 1 });

module.exports = mongoose.model('Event', EventSchema);
