/**
 * @fileoverview User model for the College Event Management System.
 * Defines the schema for users with roles: admin, organizer, student.
 * Includes password hashing and comparison methods.
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} UserSchema
 * @property {string} name - User's full name (required)
 * @property {string} email - User's email address (unique, required, lowercase)
 * @property {string} password - Hashed password (required, minlength 6)
 * @property {string} role - User role: admin | organizer | student (default: student)
 * @property {string} department - User's department
 * @property {string} phone - User's phone number
 * @property {string} avatar - URL/path to user's avatar image
 * @property {Date} createdAt - Account creation timestamp
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'organizer', 'student'],
        message: 'Role must be admin, organizer, or student',
      },
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
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
 * Pre-save middleware to hash the password before saving.
 * Only hashes the password if it has been modified (or is new).
 * Uses bcrypt with 10 salt rounds.
 */
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare an entered password with the stored hashed password.
 * @param {string} enteredPassword - The plain-text password to compare
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
