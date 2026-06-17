/**
 * Sidebar — collapsible navigation panel.
 *
 * Features:
 *  - Role-based nav items (student / organizer / admin)
 *  - Active route highlighting with gradient
 *  - User info + role badge at bottom
 *  - Glassmorphism in dark mode
 *  - Mobile: full-screen overlay with hamburger toggle
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiCalendarDays,
  HiTicket,
  HiAcademicCap,
  HiUserCircle,
  HiPlusCircle,
  HiUsers,
  HiChartBar,
  HiArrowLeftOnRectangle,
  HiXMark,
  HiSparkles,
  HiRectangleStack,
  HiClipboardDocumentList,
} from 'react-icons/hi2';

/* ── Navigation config per role ────────────────────────────── */
const NAV_ITEMS = {
  student: [
    { label: 'Dashboard', icon: HiHome, to: '/student/dashboard' },
    { label: 'Browse Events', icon: HiCalendarDays, to: '/student/events' },
    { label: 'My Registrations', icon: HiTicket, to: '/student/registrations' },
    { label: 'My Certificates', icon: HiAcademicCap, to: '/student/certificates' },
    { label: 'Profile', icon: HiUserCircle, to: '/student/profile' },
  ],
  organizer: [
    { label: 'Dashboard', icon: HiHome, to: '/organizer/dashboard' },
    { label: 'My Events', icon: HiRectangleStack, to: '/organizer/events' },
    { label: 'Create Event', icon: HiPlusCircle, to: '/organizer/events/create' },
    { label: 'Profile', icon: HiUserCircle, to: '/organizer/profile' },
  ],
  admin: [
    { label: 'Dashboard', icon: HiHome, to: '/admin/dashboard' },
    { label: 'Manage Users', icon: HiUsers, to: '/admin/users' },
    { label: 'Manage Events', icon: HiClipboardDocumentList, to: '/admin/events' },
    { label: 'Reports', icon: HiChartBar, to: '/admin/reports' },
    { label: 'Profile', icon: HiUserCircle, to: '/admin/profile' },
  ],
};

/* ── Role badge colours ──────────────────────────────────── */
const ROLE_BADGE = {
  student: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  organizer: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  admin: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role ?? 'student';
  const items = NAV_ITEMS[role] ?? NAV_ITEMS.student;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar panel ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          flex flex-col
          bg-white dark:bg-surface-900/80
          dark:backdrop-blur-xl
          border-r border-surface-200 dark:border-surface-700/60
          shadow-xl dark:shadow-black/30
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* ── Brand / logo ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 dark:border-surface-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text tracking-tight">
              CampusEvents
            </span>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <HiXMark className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {/* ── Nav links ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/70 hover:text-surface-900 dark:hover:text-surface-200'
                }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-surface-400 dark:text-surface-500 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                    }`}
                  />
                  <span>{item.label}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User info + logout ── */}
        <div className="border-t border-surface-200 dark:border-surface-700/60 p-4 space-y-3">
          {/* User card */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
                {user?.name ?? 'User'}
              </p>
              <span
                className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${ROLE_BADGE[role] ?? ROLE_BADGE.student}`}
              >
                {role}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl text-sm font-medium
              text-red-600 dark:text-red-400
              bg-red-50 dark:bg-red-500/10
              hover:bg-red-100 dark:hover:bg-red-500/20
              border border-red-200 dark:border-red-500/20
              transition-all duration-200
              active:scale-95
            "
          >
            <HiArrowLeftOnRectangle className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
