/**
 * App.jsx — root component with all route definitions.
 *
 * Structure:
 *  - Public routes  → /login, /register
 *  - Student routes → /student/* (ProtectedRoute role='student')
 *  - Organizer routes → /organizer/* (ProtectedRoute role='organizer')
 *  - Admin routes   → /admin/* (ProtectedRoute role='admin')
 *  - Catch-all      → 404 Not Found
 *
 * Pages that haven't been built yet use inline placeholder components.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { HiSparkles } from 'react-icons/hi2';

/* ====================================================================
   Placeholder page factory — returns a simple styled placeholder
   for pages that will be implemented later by another agent.
   ==================================================================== */
function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-500/10 dark:to-accent-500/10 flex items-center justify-center">
        <HiSparkles className="w-10 h-10 text-primary-500" />
      </div>
      <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">{title}</h2>
      <p className="text-surface-500 dark:text-surface-400 text-sm">
        This page is coming soon — stay tuned!
      </p>
      <div className="h-1 w-24 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
    </div>
  );
}

/* ── Public pages ───────────────────────────── */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* ── Student pages ──────────────────────────── */
import StudentDashboard from './pages/student/StudentDashboard';
import EventsListPage from './pages/student/EventsListPage';
import EventDetailPage from './pages/student/EventDetailPage';
import MyRegistrationsPage from './pages/student/MyRegistrationsPage';
import MyCertificatesPage from './pages/student/MyCertificatesPage';
import FeedbackPage from './pages/student/FeedbackPage';

/* ── Organizer pages ────────────────────────── */
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEventPage from './pages/organizer/CreateEventPage';
import EditEventPage from './pages/organizer/EditEventPage';
import EventParticipantsPage from './pages/organizer/EventParticipantsPage';
import QRScannerPage from './pages/organizer/QRScannerPage';
import EventFeedbackPage from './pages/organizer/EventFeedbackPage';

/* ── Admin pages ────────────────────────────── */
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageEventsPage from './pages/admin/ManageEventsPage';
import ReportsPage from './pages/admin/ReportsPage';

/* ── Shared pages ──────────────────────────────────────────── */
import ProfilePage from './pages/student/ProfilePage'; // Or shared profile page

/* ── 404 page ──────────────────────────────────────────────── */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-surface-50 dark:bg-surface-950 animate-fade-in">
      <h1 className="text-8xl font-black gradient-text">404</h1>
      <p className="text-xl font-semibold text-surface-700 dark:text-surface-300">
        Page not found
      </p>
      <p className="text-surface-500 dark:text-surface-400 text-sm max-w-xs text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <a
        href="/login"
        className="
          mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white
          bg-gradient-to-r from-primary-600 to-accent-600
          hover:from-primary-500 hover:to-accent-500
          shadow-lg shadow-primary-500/25
          transition-all duration-300 active:scale-95
        "
      >
        Go Home
      </a>
    </div>
  );
}

/* ====================================================================
   App Router
   ==================================================================== */
export default function App() {
  return (
    <Routes>
      {/* ── Public routes ──────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Student routes ─────────────────────────────────── */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="events" element={<EventsListPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="registrations" element={<MyRegistrationsPage />} />
                <Route path="certificates" element={<MyCertificatesPage />} />
                <Route path="feedback/:eventId" element={<FeedbackPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Organizer routes ───────────────────────────────── */}
      <Route
        path="/organizer/*"
        element={
          <ProtectedRoute roles={['organizer']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<OrganizerDashboard />} />
                <Route path="events/create" element={<CreateEventPage />} />
                <Route path="events/:id/edit" element={<EditEventPage />} />
                <Route path="events/:id/participants" element={<EventParticipantsPage />} />
                <Route path="events/:id/scan" element={<QRScannerPage />} />
                <Route path="events/:id/feedback" element={<EventFeedbackPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Admin routes ───────────────────────────────────── */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsersPage />} />
                <Route path="events" element={<ManageEventsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* ── 404 catch-all ──────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
