/**
 * @fileoverview Registration model for the College Event Management System.
 * Tracks user registrations for events, including QR code data for attendance.
 * @module models/Registration
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} RegistrationSchema
 * @property {ObjectId} event - Reference to the Event
 * @property {ObjectId} user - Reference to the User
 * @property {string} qrCode - Base64 data URL of the QR code image
 * @property {string} qrToken - Unique token embedded in the QR code for verification
 * @property {string} status - Registration status: registered | attended | cancelled
 * @property {Date} registeredAt - Registration timestamp
 */
const RegistrationSchema = new mongoose.Schema(
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
    qrCode: {
      type: String,
    },
    qrToken: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ['registered', 'attended', 'cancelled'],
        message: 'Status must be registered, attended, or cancelled',
      },
      default: 'registered',
    },
    registeredAt: {
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
 * Compound unique index to prevent a user from registering
 * for the same event more than once.
 */
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
