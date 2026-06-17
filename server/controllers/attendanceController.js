/**
 * @fileoverview Attendance controller.
 * Handles QR-based attendance verification and attendance record retrieval.
 * @module controllers/attendanceController
 */

const Attendance = require('../models/Attendance');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

/**
 * @desc    Verify attendance using QR token
 * @route   POST /api/attendance/verify
 * @access  Private (Organizer)
 * @param   {import('express').Request} req - Express request (body: qrToken, eventId)
 * @param   {import('express').Response} res - Express response
 */
const verifyAttendance = async (req, res) => {
  try {
    const { qrToken, eventId } = req.body;

    if (!qrToken || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'QR token and event ID are required',
      });
    }

    // Find the registration by QR token
    const registration = await Registration.findOne({ qrToken }).populate(
      'user',
      'name email department'
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code. No registration found.',
      });
    }

    // Verify the registration belongs to the correct event
    if (registration.event.toString() !== eventId) {
      return res.status(400).json({
        success: false,
        message: 'This QR code does not belong to this event',
      });
    }

    // Check if registration is cancelled
    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This registration has been cancelled',
      });
    }

    // Check if attendance already marked
    if (registration.status === 'attended') {
      return res.status(400).json({
        success: false,
        message: 'Attendance has already been marked for this participant',
      });
    }

    // Check for existing attendance record
    const existingAttendance = await Attendance.findOne({
      event: eventId,
      user: registration.user._id,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this user at this event',
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      event: eventId,
      user: registration.user._id,
      registration: registration._id,
      markedBy: req.user.id,
    });

    // Update registration status to 'attended'
    registration.status = 'attended';
    await registration.save();

    // Populate the attendance record for response
    await attendance.populate('user', 'name email department');
    await attendance.populate('event', 'title');

    res.status(200).json({
      success: true,
      message: `Attendance verified for ${registration.user.name}`,
      data: {
        attendance,
        participant: registration.user,
      },
    });
  } catch (error) {
    console.error('VerifyAttendance error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error verifying attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get attendance list for a specific event
 * @route   GET /api/attendance/event/:eventId
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check authorization
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view attendance for this event',
      });
    }

    const attendance = await Attendance.find({ event: eventId })
      .populate('user', 'name email department phone')
      .populate('markedBy', 'name')
      .sort({ markedAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error('GetEventAttendance error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user's attendance records
 * @route   GET /api/attendance/my
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title description category venue date time status',
        populate: {
          path: 'organizer',
          select: 'name',
        },
      })
      .sort({ markedAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error('GetMyAttendance error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attendance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  verifyAttendance,
  getEventAttendance,
  getMyAttendance,
};
