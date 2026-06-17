/**
 * @fileoverview Database seed script for development and testing.
 * Populates the database with sample users, events, and registrations.
 * @module utils/seedData
 *
 * Usage: node utils/seedData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Certificate = require('../models/Certificate');

/**
 * Generates a future date offset by the specified number of days from today.
 * @param {number} daysFromNow - Number of days in the future
 * @returns {Date} Future date
 */
const futureDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

/**
 * Main seed function.
 * Clears all collections and populates with sample data.
 * @async
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // ─── Clear all collections ──────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Attendance.deleteMany({}),
      Feedback.deleteMany({}),
      Certificate.deleteMany({}),
    ]);
    console.log('   All collections cleared.');

    // ─── Create Users ───────────────────────────────────────────
    console.log('👤 Creating users...');

    // Hash passwords manually since we use insertMany (bypasses pre-save hooks)
    const salt = await bcrypt.genSalt(10);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@campus.com',
        password: 'admin123',
        role: 'admin',
        department: 'Administration',
        phone: '9876543210',
      },
      {
        name: 'Event Organizer',
        email: 'organizer@campus.com',
        password: 'organizer123',
        role: 'organizer',
        department: 'Computer Science',
        phone: '9876543211',
      },
      {
        name: 'John Student',
        email: 'student@campus.com',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        phone: '9876543212',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@campus.com',
        password: 'student123',
        role: 'student',
        department: 'Electronics',
        phone: '9876543213',
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@campus.com',
        password: 'student123',
        role: 'student',
        department: 'Mechanical',
        phone: '9876543214',
      },
    ]);

    const [admin, organizer, student1, student2, student3] = users;
    console.log(`   Created ${users.length} users.`);

    // ─── Create Events ──────────────────────────────────────────
    console.log('📅 Creating events...');

    const events = await Event.create([
      {
        title: 'Introduction to Machine Learning',
        description:
          'A comprehensive workshop covering the fundamentals of machine learning, including supervised learning, unsupervised learning, and neural networks. Hands-on exercises with Python and scikit-learn.',
        category: 'workshop',
        venue: 'Seminar Hall A, Main Building',
        date: futureDate(7),
        time: '10:00 AM - 4:00 PM',
        registrationDeadline: futureDate(5),
        maxParticipants: 50,
        currentParticipants: 0,
        organizer: organizer._id,
        status: 'upcoming',
      },
      {
        title: 'Cloud Computing Seminar',
        description:
          'Industry experts discuss the latest trends in cloud computing, including AWS, Azure, and Google Cloud Platform. Learn about serverless architectures, containerization, and DevOps practices.',
        category: 'seminar',
        venue: 'Auditorium, Block B',
        date: futureDate(14),
        time: '2:00 PM - 5:00 PM',
        registrationDeadline: futureDate(12),
        maxParticipants: 100,
        currentParticipants: 0,
        organizer: organizer._id,
        status: 'upcoming',
      },
      {
        title: 'CodeStorm Hackathon 2026',
        description:
          'A 24-hour hackathon where teams of 3-4 members build innovative solutions to real-world problems. Prizes worth ₹50,000 for top 3 teams. Mentorship from industry professionals.',
        category: 'hackathon',
        venue: 'Innovation Lab, Tech Block',
        date: futureDate(21),
        time: '9:00 AM (24 hours)',
        registrationDeadline: futureDate(18),
        maxParticipants: 120,
        currentParticipants: 0,
        organizer: organizer._id,
        status: 'upcoming',
      },
      {
        title: 'Annual Cultural Fest - Rhythms 2026',
        description:
          'The annual cultural extravaganza featuring dance, music, drama, and art competitions. Open to all departments. Individual and group performances welcome.',
        category: 'cultural',
        venue: 'Open Air Theatre',
        date: futureDate(30),
        time: '5:00 PM - 10:00 PM',
        registrationDeadline: futureDate(25),
        maxParticipants: 200,
        currentParticipants: 0,
        organizer: admin._id,
        status: 'upcoming',
      },
      {
        title: 'Inter-Department Cricket Tournament',
        description:
          'Annual cricket tournament between all departments. T20 format with knockout rounds. Register your team of 11+4 players. Trophies and medals for winners and runners-up.',
        category: 'sports',
        venue: 'College Cricket Ground',
        date: futureDate(10),
        time: '8:00 AM - 6:00 PM',
        registrationDeadline: futureDate(8),
        maxParticipants: 80,
        currentParticipants: 0,
        organizer: organizer._id,
        status: 'upcoming',
      },
    ]);

    console.log(`   Created ${events.length} events.`);

    // ─── Create Sample Registrations ────────────────────────────
    console.log('📝 Creating sample registrations...');

    const registrations = await Registration.create([
      {
        event: events[0]._id,
        user: student1._id,
        qrToken: 'seed-token-001',
        status: 'registered',
      },
      {
        event: events[0]._id,
        user: student2._id,
        qrToken: 'seed-token-002',
        status: 'registered',
      },
      {
        event: events[1]._id,
        user: student1._id,
        qrToken: 'seed-token-003',
        status: 'registered',
      },
      {
        event: events[2]._id,
        user: student3._id,
        qrToken: 'seed-token-004',
        status: 'registered',
      },
    ]);

    // Update currentParticipants counts
    await Event.findByIdAndUpdate(events[0]._id, { currentParticipants: 2 });
    await Event.findByIdAndUpdate(events[1]._id, { currentParticipants: 1 });
    await Event.findByIdAndUpdate(events[2]._id, { currentParticipants: 1 });

    console.log(`   Created ${registrations.length} registrations.`);

    // ─── Done ───────────────────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────────────');
    console.log('  Sample Login Credentials:');
    console.log('  Admin:     admin@campus.com     / admin123');
    console.log('  Organizer: organizer@campus.com / organizer123');
    console.log('  Student:   student@campus.com   / student123');
    console.log('  Student:   priya@campus.com     / student123');
    console.log('  Student:   rahul@campus.com     / student123');
    console.log('─────────────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
