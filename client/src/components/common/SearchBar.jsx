/**
 * SearchBar — search input with optional category & status filters.
 *
 * Props:
 *  - onSearch        : (query: string) => void
 *  - onCategoryChange: (category: string) => void
 *  - onStatusChange  : (status: string) => void
 *  - categories      : string[]  (default event categories)
 *  - statuses        : string[]  (default event statuses)
 *  - placeholder     : string
 *  - showFilters     : boolean (default true)
 */

import { useState, useEffect, useRef } from 'react';
import { HiMagnifyingGlass, HiXMark, HiFunnel } from 'react-icons/hi2';

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Technical',
  'Cultural',
  'Sports',
  'Workshop',
  'Seminar',
  'Hackathon',
  'Other',
];

const DEFAULT_STATUSES = ['All Status', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export default function SearchBar({
  onSearch,
  onCategoryChange,
  onStatusChange,
  categories = DEFAULT_CATEGORIES,
  statuses = DEFAULT_STATUSES,
  placeholder = 'Search events…',
  showFilters = true,
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [status, setStatus] = useState(statuses[0]);
  const debounceRef = useRef(null);

  // ── Debounced search (300 ms) ──────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(query);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query, onSearch]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    onCategoryChange?.(value === categories[0] ? '' : value);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    onStatusChange?.(value === statuses[0] ? '' : value);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory(categories[0]);
    setStatus(statuses[0]);
    onSearch?.('');
    onCategoryChange?.('');
    onStatusChange?.('');
  };

  const hasActiveFilters = query || category !== categories[0] || status !== statuses[0];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-2.5 rounded-xl
            bg-white dark:bg-surface-800
            border border-surface-200 dark:border-surface-700
            text-surface-900 dark:text-surface-100
            placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            transition-all duration-200
          "
        />
      </div>

      {showFilters && (
        <>
          {/* Category filter */}
          <div className="relative">
            <HiFunnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="
                pl-9 pr-8 py-2.5 rounded-xl appearance-none
                bg-white dark:bg-surface-800
                border border-surface-200 dark:border-surface-700
                text-surface-900 dark:text-surface-100
                focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
                transition-all duration-200 cursor-pointer text-sm
              "
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="
                px-4 py-2.5 rounded-xl appearance-none
                bg-white dark:bg-surface-800
                border border-surface-200 dark:border-surface-700
                text-surface-900 dark:text-surface-100
                focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
                transition-all duration-200 cursor-pointer text-sm
              "
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="
                inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl
                text-sm font-medium
                text-red-600 dark:text-red-400
                bg-red-50 dark:bg-red-500/10
                hover:bg-red-100 dark:hover:bg-red-500/20
                border border-red-200 dark:border-red-500/20
                transition-all duration-200
              "
            >
              <HiXMark className="w-4 h-4" />
              Clear
            </button>
          )}
        </>
      )}
    </div>
  );
}
