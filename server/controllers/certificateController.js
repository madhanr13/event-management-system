/**
 * @fileoverview Certificate controller.
 * Handles participation certificate generation and retrieval.
 * @module controllers/certificateController
 */

const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const generateCertificatePDF = require('../utils/pdfGenerator');

/**
 * @desc    Generate a participation certificate for an attended event
 * @route   GET /api/certificates/generate/:eventId
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const generateCertificate = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Verify the event exists
    const event = await Event.findById(eventId).populate('organizer', 'name');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if the user has attended the event
    const attendance = await Attendance.findOne({
      event: eventId,
      user: userId,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'You can only generate certificates for events you have attended',
      });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      event: eventId,
      user: userId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already generated',
        data: existingCertificate,
      });
    }

    // Get user details
    const user = await User.findById(userId);

    // Format the event date
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate the PDF certificate
    const pdfBuffer = await generateCertificatePDF({
      participantName: user.name,
      eventName: event.title,
      eventDate: eventDate,
      organizerName: event.organizer.name,
    });

    // Ensure certificates directory exists
    const certDir = path.join(__dirname, '..', 'uploads', 'certificates');
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Save the PDF file
    const fileName = `cert_${eventId}_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Create certificate record in database
    const certificateUrl = `/uploads/certificates/${fileName}`;
    const certificate = await Certificate.create({
      event: eventId,
      user: userId,
      attendance: attendance._id,
      certificateUrl,
    });

    // Populate for response
    await certificate.populate('event', 'title date');
    await certificate.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate,
    });
  } catch (error) {
    console.error('GenerateCertificate error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error generating certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get current user's certificates
 * @route   GET /api/certificates/my
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request
 * @param   {import('express').Response} res - Express response
 */
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user.id })
      .populate({
        path: 'event',
        select: 'title category date venue',
        populate: {
          path: 'organizer',
          select: 'name',
        },
      })
      .sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    console.error('GetMyCertificates error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching certificates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  generateCertificate,
  getMyCertificates,
};
