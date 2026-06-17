/**
 * @fileoverview Certificate model for the College Event Management System.
 * Stores records of generated participation certificates.
 * @module models/Certificate
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} CertificateSchema
 * @property {ObjectId} event - Reference to the Event
 * @property {ObjectId} user - Reference to the User (certificate recipient)
 * @property {ObjectId} attendance - Reference to the Attendance record
 * @property {string} certificateUrl - File path or URL to the generated certificate PDF
 * @property {Date} generatedAt - Certificate generation timestamp
 */
const CertificateSchema = new mongoose.Schema(
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
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
      required: [true, 'Attendance reference is required'],
    },
    certificateUrl: {
      type: String,
    },
    generatedAt: {
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
 * Compound unique index to prevent duplicate certificate generation
 * for the same user at the same event.
 */
CertificateSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
