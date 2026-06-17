/**
 * @fileoverview Validation middleware using express-validator.
 * Checks for validation errors and returns a structured error response.
 * @module middleware/validate
 */

const { validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors from express-validator.
 * If validation errors exist, returns a 400 response with an array of error messages.
 * If no errors, passes control to the next middleware.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void}
 *
 * @example
 * // Use after express-validator checks in route definitions
 * router.post('/register',
 *   [
 *     body('email').isEmail().withMessage('Valid email is required'),
 *     body('password').isLength({ min: 6 }),
 *   ],
 *   validate,
 *   authController.register
 * );
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
