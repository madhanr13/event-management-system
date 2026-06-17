/**
 * @fileoverview Feedback model for the College Event Management System.
 * Stores user ratings and comments for events they attended.
 * @module models/Feedback
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} FeedbackSchema
 * @property {ObjectId} event - Reference to the Event
 * @property {ObjectId} user - Reference to the User who gave feedback
 * @property {number} rating - Numeric rating from 1 to 5 (required)
 * @property {string} comment - Optional text comment
 * @property {Date} createdAt - Feedback submission timestamp
 */
const FeedbackSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
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
 * Compound unique index to prevent a user from submitting
 * feedback for the same event more than once.
 */
FeedbackSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
