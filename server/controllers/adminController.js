/**
 * @fileoverview Admin controller.
 * Handles administrative operations: dashboard stats, user management,
 * event management, and report generation.
 * @module controllers/adminController
 */

const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getDashboard = async (req, res) => {
  try {
    // Fetch all counts in parallel
    const [
      totalUsers,
      totalEvents,
      totalRegistrations,
      totalAttendance,
      usersByRole,
      recentEvents,
      eventsByCategory,
    ] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Registration.countDocuments({ status: { $ne: 'cancelled' } }),
      Attendance.countDocuments(),
      // Users grouped by role
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      // Recent 5 events
      Event.find()
        .populate('organizer', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title category date status currentParticipants maxParticipants'),
      // Events grouped by category
      Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Transform usersByRole into a cleaner object
    const rolesCounts = {};
    usersByRole.forEach((item) => {
      rolesCounts[item._id] = item.count;
    });

    // Transform eventsByCategory into a cleaner object
    const categoryCounts = {};
    eventsByCategory.forEach((item) => {
      categoryCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalEvents,
          totalRegistrations,
          totalAttendance,
        },
        usersByRole: rolesCounts,
        recentEvents,
        eventsByCategory: categoryCounts,
      },
    });
  } catch (error) {
    console.error('GetDashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/admin/users
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request (query: page, limit, search, role)
 * @param   {import('express').Response} res - Express response
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    console.error('GetUsers error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update a user's role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request (params: id, body: role)
 * @param   {import('express').Response} res - Express response
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'organizer', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (admin, organizer, or student)',
      });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      data: user,
    });
  } catch (error) {
    console.error('UpdateUserRole error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Delete a user and their related data
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request (params: id)
 * @param   {import('express').Response} res - Express response
 */
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete all related data
    await Promise.all([
      Registration.deleteMany({ user: req.params.id }),
      Attendance.deleteMany({ user: req.params.id }),
      Feedback.deleteMany({ user: req.params.id }),
      Certificate.deleteMany({ user: req.params.id }),
    ]);

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${user.name}' and related data deleted successfully`,
    });
  } catch (error) {
    console.error('DeleteUser error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Admin delete any event
 * @route   DELETE /api/admin/events/:id
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request (params: id)
 * @param   {import('express').Response} res - Express response
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Delete all related data
    await Promise.all([
      Registration.deleteMany({ event: req.params.id }),
      Attendance.deleteMany({ event: req.params.id }),
      Feedback.deleteMany({ event: req.params.id }),
      Certificate.deleteMany({ event: req.params.id }),
    ]);

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Event '${event.title}' and all related data deleted successfully`,
    });
  } catch (error) {
    console.error('DeleteEvent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get detailed reports (events by month, registrations by month, popular categories, top events)
 * @route   GET /api/admin/reports
 * @access  Private (Admin)
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getReports = async (req, res) => {
  try {
    const [
      eventsByMonth,
      registrationsByMonth,
      popularCategories,
      topEventsByRegistrations,
    ] = await Promise.all([
      // Events created per month (last 12 months)
      Event.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),

      // Registrations per month (last 12 months)
      Registration.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: {
              year: { $year: '$registeredAt' },
              month: { $month: '$registeredAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 },
      ]),

      // Most popular categories (by number of registrations)
      Registration.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $lookup: {
            from: 'events',
            localField: 'event',
            foreignField: '_id',
            as: 'eventDetails',
          },
        },
        { $unwind: '$eventDetails' },
        {
          $group: {
            _id: '$eventDetails.category',
            totalRegistrations: { $sum: 1 },
          },
        },
        { $sort: { totalRegistrations: -1 } },
      ]),

      // Top 10 events by registration count
      Event.find()
        .populate('organizer', 'name')
        .sort({ currentParticipants: -1 })
        .limit(10)
        .select('title category currentParticipants maxParticipants date status'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        eventsByMonth,
        registrationsByMonth,
        popularCategories,
        topEventsByRegistrations,
      },
    });
  } catch (error) {
    console.error('GetReports error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error generating reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUserRole,
  deleteUser,
  deleteEvent,
  getReports,
};
