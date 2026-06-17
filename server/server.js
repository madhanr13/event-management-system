/**
 * @fileoverview Main server entry point for the College Event Management System.
 * Configures Express application, middleware, routes, and database connection.
 * @module server
 *
 * @description
 * College Event Management System - Backend API
 *
 * Features:
 * - User authentication & authorization (JWT-based)
 * - Event CRUD with poster uploads
 * - Event registration with QR code generation
 * - Attendance verification via QR scanning
 * - Feedback & rating system
 * - Certificate generation (PDF)
 * - Admin dashboard & analytics
 * - CSV export of participants
 *
 * Usage:
 *   Development: npm run dev
 *   Production:  npm start
 *   Seed DB:     node utils/seedData.js
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// ─── Load Environment Variables ─────────────────────────────────
dotenv.config();

// ─── Import Database Connection ─────────────────────────────────
const connectDB = require('./config/db');

// ─── Import Route Files ─────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// ─── Import Error Handler Middleware ────────────────────────────
const errorHandler = require('./middleware/errorHandler');

// ─── Initialize Express Application ────────────────────────────
const app = express();

// ─── Connect to Database ────────────────────────────────────────
connectDB();

// ─── Global Middleware ──────────────────────────────────────────

// Enable CORS for all origins (configure as needed for production)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Health Check Route ─────────────────────────────────────
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎓 College Event Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      events: '/api/events',
      registrations: '/api/registrations',
      attendance: '/api/attendance',
      feedback: '/api/feedback',
      certificates: '/api/certificates',
      users: '/api/users',
      admin: '/api/admin',
    },
  });
});

// ─── Mount API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 Handler for Unknown Routes ────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler (must be last middleware) ─────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log(`🎓 College Event Management System API`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════');
});

// ─── Handle Unhandled Promise Rejections ────────────────────────
process.on('unhandledRejection', (err, promise) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server and exit gracefully
  server.close(() => {
    process.exit(1);
  });
});

// ─── Handle Uncaught Exceptions ─────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
