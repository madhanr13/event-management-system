/**
 * @fileoverview Feedback controller.
 * Handles feedback submission, retrieval, and statistics for events.
 * @module controllers/feedbackController
 */

const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

/**
 * @desc    Submit feedback for an attended event
 * @route   POST /api/feedback
 * @access  Private (Student)
 * @param   {import('express').Request} req - Express request (body: eventId, rating, comment)
 * @param   {import('express').Response} res - Express response
 */
const submitFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    // Verify the event exists
    const event = await Event.findById(eventId);
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
        message: 'You can only submit feedback for events you have attended',
      });
    }

    // Check for duplicate feedback
    const existingFeedback = await Feedback.findOne({
      event: eventId,
      user: userId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event',
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      event: eventId,
      user: userId,
      rating,
      comment,
    });

    await feedback.populate('user', 'name email');
    await feedback.populate('event', 'title');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    });
  } catch (error) {
    console.error('SubmitFeedback error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error submitting feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get all feedback for a specific event
 * @route   GET /api/feedback/event/:eventId
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const getEventFeedback = async (req, res) => {
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

    const feedback = await Feedback.find({ event: eventId })
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error) {
    console.error('GetEventFeedback error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * @desc    Get feedback statistics for a specific event
 * @route   GET /api/feedback/event/:eventId/stats
 * @access  Private (Organizer, Admin)
 * @param   {import('express').Request} req - Express request (params: eventId)
 * @param   {import('express').Response} res - Express response
 */
const getEventFeedbackStats = async (req, res) => {
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

    // Calculate statistics using aggregation pipeline
    const stats = await Feedback.aggregate([
      { $match: { event: event._id } },
      {
        $group: {
          _id: '$event',
          averageRating: { $avg: '$rating' },
          totalCount: { $sum: 1 },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          eventId,
          eventTitle: event.title,
          averageRating: 0,
          totalCount: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        },
      });
    }

    const result = stats[0];

    res.status(200).json({
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        averageRating: Math.round(result.averageRating * 100) / 100,
        totalCount: result.totalCount,
        ratingDistribution: {
          1: result.rating1,
          2: result.rating2,
          3: result.rating3,
          4: result.rating4,
          5: result.rating5,
        },
      },
    });
  } catch (error) {
    console.error('GetEventFeedbackStats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  submitFeedback,
  getEventFeedback,
  getEventFeedbackStats,
};
