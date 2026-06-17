/**
 * EventCard — a beautiful card for event listings.
 *
 * Props:
 *  - event : { _id, title, category, date, venue, organizer, poster,
 *              registeredCount, maxParticipants, status }
 *  - onClick : () => void (optional, defaults to navigate)
 */

import { useNavigate } from 'react-router-dom';
import {
  HiCalendarDays,
  HiMapPin,
  HiUserGroup,
  HiUser,
} from 'react-icons/hi2';

/* ── Category badge colours ─────────────────────────────── */
const CATEGORY_COLORS = {
  Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  Cultural: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300',
  Sports: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  Workshop: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Seminar: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  Hackathon: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  Other: 'bg-surface-100 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
};

/* ── Status pill colours ─────────────────────────────────── */
const STATUS_COLORS = {
  upcoming: 'bg-emerald-500',
  ongoing: 'bg-amber-500',
  completed: 'bg-surface-400',
  cancelled: 'bg-red-500',
};

/** Gradient placeholders when no poster image exists. */
const GRADIENT_PLACEHOLDERS = [
  'from-primary-500 to-accent-500',
  'from-accent-500 to-pink-500',
  'from-cyan-500 to-primary-500',
  'from-amber-500 to-red-500',
  'from-emerald-500 to-teal-500',
];

function pickGradient(id = '') {
  const idx =
    typeof id === 'string'
      ? id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      : 0;
  return GRADIENT_PLACEHOLDERS[idx % GRADIENT_PLACEHOLDERS.length];
}

export default function EventCard({ event, onClick }) {
  const navigate = useNavigate();

  const {
    _id,
    title,
    category = 'Other',
    date,
    venue,
    organizer,
    poster,
    registeredCount = 0,
    maxParticipants,
    status = 'upcoming',
  } = event;

  const handleClick = () => {
    if (onClick) return onClick();
    
    // Determine the base path based on the current URL
    const pathname = window.location.pathname;
    let basePath = '/student';
    if (pathname.startsWith('/organizer')) basePath = '/organizer';
    else if (pathname.startsWith('/admin')) basePath = '/admin';
    
    navigate(`${basePath}/events/${_id}`);
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  const capacityPct = maxParticipants
    ? Math.min((registeredCount / maxParticipants) * 100, 100)
    : 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group text-left w-full
        bg-white dark:bg-surface-800
        rounded-2xl overflow-hidden
        border border-surface-200 dark:border-surface-700
        shadow-sm hover:shadow-xl dark:hover:shadow-black/30
        hover:-translate-y-1
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-primary-500/40
      "
    >
      {/* ── Poster / gradient placeholder ── */}
      <div className="relative h-44 overflow-hidden">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${pickGradient(_id)} flex items-center justify-center`}
          >
            <span className="text-5xl font-bold text-white/30">
              {title?.charAt(0)?.toUpperCase() ?? 'E'}
            </span>
          </div>
        )}

        {/* Status dot */}
        <span
          className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-surface-800 ${STATUS_COLORS[status] ?? STATUS_COLORS.upcoming}`}
          title={status}
        />

        {/* Category badge */}
        <span
          className={`
            absolute bottom-3 left-3 px-2.5 py-0.5 text-xs font-semibold rounded-full
            ${CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other}
          `}
        >
          {category}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">
        <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        <div className="space-y-1.5 text-sm text-surface-500 dark:text-surface-400">
          <p className="flex items-center gap-2">
            <HiCalendarDays className="w-4 h-4 flex-shrink-0 text-primary-500" />
            {formattedDate}
          </p>
          <p className="flex items-center gap-2">
            <HiMapPin className="w-4 h-4 flex-shrink-0 text-accent-500" />
            <span className="truncate">{venue || 'TBD'}</span>
          </p>
          <p className="flex items-center gap-2">
            <HiUser className="w-4 h-4 flex-shrink-0 text-surface-400" />
            <span className="truncate">
              {typeof organizer === 'object' ? organizer?.name : organizer || 'Organizer'}
            </span>
          </p>
        </div>

        {/* Capacity bar */}
        {maxParticipants && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
              <span className="flex items-center gap-1">
                <HiUserGroup className="w-3.5 h-3.5" />
                {registeredCount}/{maxParticipants}
              </span>
              <span>{Math.round(capacityPct)}%</span>
            </div>
            <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
