/**
 * @fileoverview Registration controller.
 * Handles event registration, cancellation, listing, and participant CSV export.
 * @module controllers/registrationController
 */

const crypto = require('crypto');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const generateQRCode = require('../utils/qrCode');

/**
 * @desc    Register the current user for an event
 * @route   POST /api/registrations
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request (body: eventId)
 * @param   {import('express').Response} res - Express response
 */
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if event is cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for a cancelled event',
      });
    }

    // Check registration deadline
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed',
      });
    }

    // Check capacity
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity',
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: userId,
    });

    if (existingRegistration) {
      // If previously cancelled, allow re-registration
      if (existingRegistration.status === 'cancelled') {
        // Generate new QR token
        const qrToken = crypto.randomBytes(32).toString('hex');
        const qrData = JSON.stringify({
          token: qrToken,
          eventId: eventId,
          userId: userId,
        });
        const qrCode = await generateQRCode(qrData);

        existingRegistration.qrToken = qrToken;
        existingRegistration.qrCode = qrCode;
        existingRegistration.status = 'registered';
        existingRegistration.registeredAt = new Date();
        await existingRegistration.save();

        // Increment participant count
        await Event.findByIdAndUpdate(eventId, {
          $inc: { currentParticipants: 1 },
        });

        return res.status(200).json({
          success: true,
          message: 'Re-registered for event successfully',
          data: existingRegistration,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event',
      });
    }

    // Generate unique QR token using crypto
    const qrToken = crypto.randomBytes(32).toString('hex');

    // Generate QR code data URL
    const qrData = JSON.stringify({
      token: qrToken,
      eventId: eventId,
      userId: userId,
    });
    const qrCode = await generateQRCode(qrData);

    // Create the registration
    const registration = await Registration.create({
      event: eventId,
      user: userId,
      qrCode,
      qrToken,
    });

    // Increment current participants count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { currentParticipants: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Registered for event successfully',
      data: registration,
    });
  } catch (error) {
    console.error('RegisterForEvent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user's registrations
 * @route   GET /api/registrations/my
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title description category venue date time status poster organizer',
        populate: {
          path: 'organizer',
          select: 'name email',
        },
      })
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('GetMyRegistrations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching registrations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all registrations for a specific event (organizer only)
 * @route   GET /api/registrations/event/:eventId
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const getEventRegistrations = async (req, res) => {
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

    // Check if the user is the organizer of this event or an admin
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event',
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email department phone')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error('GetEventRegistrations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event registrations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Cancel a registration
 * @route   DELETE /api/registrations/:id
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request (params: id)
 * @param   {import('express').Response} res - Express response
 */
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found',
      });
    }

    // Ensure the user owns this registration
    if (registration.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration',
      });
    }

    // Check if already cancelled
    if (registration.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is already cancelled',
      });
    }

    // Check if already attended
    if (registration.status === 'attended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration after attendance has been marked',
      });
    }

    // Update registration status to cancelled
    registration.status = 'cancelled';
    await registration.save();

    // Decrement current participants count
    await Event.findByIdAndUpdate(registration.event, {
      $inc: { currentParticipants: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully',
      data: registration,
    });
  } catch (error) {
    console.error('CancelRegistration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Export event participants as CSV
 * @route   GET /api/registrations/export/:eventId
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const exportParticipants = async (req, res) => {
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
        message: 'Not authorized to export participants for this event',
      });
    }

    // Fetch registrations with user details
    const registrations = await Registration.find({
      event: eventId,
      status: { $ne: 'cancelled' },
    }).populate('user', 'name email department phone');

    // Prepare data for CSV
    const csvData = registrations.map((reg, index) => ({
      'S.No': index + 1,
      'Name': reg.user ? reg.user.name : 'N/A',
      'Email': reg.user ? reg.user.email : 'N/A',
      'Department': reg.user ? reg.user.department || 'N/A' : 'N/A',
      'Phone': reg.user ? reg.user.phone || 'N/A' : 'N/A',
      'Status': reg.status,
      'Registered At': reg.registeredAt
        ? new Date(reg.registeredAt).toLocaleString()
        : 'N/A',
    }));

    // Generate CSV using json2csv
    const { Parser } = require('json2csv');
    const fields = ['S.No', 'Name', 'Email', 'Department', 'Phone', 'Status', 'Registered At'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${event.title.replace(/[^a-zA-Z0-9]/g, '_')}_participants.csv"`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error('ExportParticipants error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error exporting participants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  exportParticipants,
};
