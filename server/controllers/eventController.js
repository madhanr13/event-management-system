/**
 * @fileoverview Event controller.
 * Handles CRUD operations for campus events with pagination, search, and filtering.
 * @module controllers/eventController
 */

const Event = require('../models/Event');
const Registration = require('../models/Registration');

/**
 * @desc    Get all events with pagination, search, and filters
 * @route   GET /api/events
 * @access  Public
 * @param   {import('express').Request} req - Express request (query: page, limit, search, category, status, sort)
 * @param   {import('express').Response} res - Express response
 */
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    // Search by title (case-insensitive partial match)
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by organizer
    if (req.query.organizer) {
      filter.organizer = req.query.organizer;
    }

    // Determine sort order (default: date ascending for upcoming events)
    let sortOption = { date: 1 };
    if (req.query.sort === 'date_desc') {
      sortOption = { date: -1 };
    } else if (req.query.sort === 'created') {
      sortOption = { createdAt: -1 };
    } else if (req.query.sort === 'title') {
      sortOption = { title: 1 };
    }

    // Execute query with pagination
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email department')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: events,
    });
  } catch (error) {
    console.error('GetEvents error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get a single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 * @param   {import('express').Request} req - Express request (params: id)
 * @param   {import('express').Response} res - Express response
 */
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'organizer',
      'name email department'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('GetEvent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (body: event fields, file: poster)
 * @param   {import('express').Response} res - Express response
 */
const createEvent = async (req, res) => {
  try {
    // Set organizer to the authenticated user
    req.body.organizer = req.user.id;

    // Handle poster file upload
    if (req.file) {
      req.body.poster = `/uploads/posters/${req.file.filename}`;
    }

    const event = await Event.create(req.body);

    // Populate organizer details for response
    await event.populate('organizer', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    console.error('CreateEvent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error creating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Update an existing event
 * @route   PUT /api/events/:id
 * @access  Private (Organizer who created, or Admin)
 * @param   {import('express').Request} req - Express request (params: id, body: updated fields, file: poster)
 * @param   {import('express').Response} res - Express response
 */
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership: organizer can only edit their own events, admin can edit any
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event. You can only edit events you created.',
      });
    }

    // Handle poster file upload
    if (req.file) {
      req.body.poster = `/uploads/posters/${req.file.filename}`;
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('organizer', 'name email department');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    console.error('UpdateEvent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error updating event',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Delete an event and all related registrations
 * @route   DELETE /api/events/:id
 * @access  Private (Organizer who created, or Admin)
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

    // Check ownership: organizer can only delete their own events, admin can delete any
    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    // Clean up related registrations
    await Registration.deleteMany({ event: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event and related registrations deleted successfully',
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

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
