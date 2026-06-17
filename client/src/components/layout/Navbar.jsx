/**
 * Navbar — sticky top bar.
 *
 * Features:
 *  - Hamburger menu toggle (mobile)
 *  - Dynamic page title derived from current route
 *  - Theme toggle with animated sun ↔ moon icon
 *  - User avatar with name
 *  - Notification bell placeholder
 *  - Glassmorphism + backdrop blur
 */

import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  HiBars3,
  HiSun,
  HiMoon,
  HiBell,
} from 'react-icons/hi2';

/* ── Derive page title from pathname ─────────────────────── */
const ROUTE_TITLES = {
  dashboard: 'Dashboard',
  events: 'Events',
  create: 'Create Event',
  edit: 'Edit Event',
  registrations: 'My Registrations',
  certificates: 'My Certificates',
  profile: 'Profile',
  users: 'Manage Users',
  reports: 'Reports',
  participants: 'Participants',
  scan: 'QR Scanner',
  feedback: 'Feedback',
};

function getPageTitle(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  // Walk backwards through segments to find the first matching title key
  for (let i = segments.length - 1; i >= 0; i--) {
    const key = segments[i];
    if (ROUTE_TITLES[key]) return ROUTE_TITLES[key];
  }
  return 'Dashboard';
}

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header
      className="
        sticky top-0 z-30 w-full
        bg-white/70 dark:bg-surface-900/60
        backdrop-blur-xl
        border-b border-surface-200/80 dark:border-surface-700/50
        transition-colors duration-300
      "
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left side — hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <HiBars3 className="w-6 h-6 text-surface-600 dark:text-surface-300" />
          </button>

          <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {pageTitle}
          </h1>
        </div>

        {/* Right side — actions */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            className="
              relative p-2 rounded-xl
              hover:bg-surface-100 dark:hover:bg-surface-800
              transition-colors
            "
            aria-label="Notifications"
          >
            <HiBell className="w-5 h-5 text-surface-500 dark:text-surface-400" />
            {/* Badge dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="
              p-2 rounded-xl
              hover:bg-surface-100 dark:hover:bg-surface-800
              transition-all duration-300
            "
            aria-label="Toggle theme"
          >
            <div className="relative w-5 h-5">
              {/* Sun icon — visible in dark mode */}
              <HiSun
                className={`
                  absolute inset-0 w-5 h-5 text-amber-400
                  transition-all duration-500
                  ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
                `}
              />
              {/* Moon icon — visible in light mode */}
              <HiMoon
                className={`
                  absolute inset-0 w-5 h-5 text-primary-500
                  transition-all duration-500
                  ${isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}
                `}
              />
            </div>
          </button>

          {/* User avatar + name */}
          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-surface-200 dark:border-surface-700">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300 max-w-[120px] truncate">
              {user?.name ?? 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
