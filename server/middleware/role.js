/**
 * @fileoverview Role-based authorization middleware.
 * Restricts route access to users with specific roles.
 * @module middleware/role
 */

/**
 * Creates a middleware that authorizes access only for specified roles.
 * Must be used AFTER the protect (auth) middleware, as it depends on req.user.
 *
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'organizer', 'student')
 * @returns {Function} Express middleware function
 *
 * @example
 * // Only admin can access this route
 * router.get('/admin-only', protect, authorize('admin'), controller);
 *
 * // Admin and organizer can access this route
 * router.get('/manage', protect, authorize('admin', 'organizer'), controller);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route. Required: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { authorize };
