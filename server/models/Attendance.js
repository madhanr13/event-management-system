/**
 * @fileoverview Attendance model for the College Event Management System.
 * Records event attendance verified via QR code scanning.
 * @module models/Attendance
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} AttendanceSchema
 * @property {ObjectId} event - Reference to the Event
 * @property {ObjectId} user - Reference to the User (attendee)
 * @property {ObjectId} registration - Reference to the Registration record
 * @property {Date} markedAt - Timestamp when attendance was marked
 * @property {ObjectId} markedBy - Reference to the User who marked attendance (organizer)
 */
const AttendanceSchema = new mongoose.Schema(
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
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: [true, 'Registration reference is required'],
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Compound unique index to prevent duplicate attendance records
 * for the same user at the same event.
 */
AttendanceSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
