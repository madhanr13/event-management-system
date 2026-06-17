/**
 * @fileoverview JWT token generation utility.
 * Creates signed JSON Web Tokens for user authentication.
 * @module utils/generateToken
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given user.
 * The token payload includes the user's ID and role.
 * Token expiry is read from the JWT_EXPIRE environment variable.
 *
 * @param {Object} user - The user object (must have _id and role properties)
 * @param {string} user._id - The user's MongoDB ObjectId
 * @param {string} user.role - The user's role (admin/organizer/student)
 * @returns {string} Signed JWT token string
 *
 * @example
 * const token = generateToken({ _id: '60d...', role: 'student' });
 * // Returns: 'eyJhbGciOiJIUzI1NiIs...'
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = generateToken;
