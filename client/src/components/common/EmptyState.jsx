/**
 * EmptyState — placeholder when a list has no data.
 *
 * Props:
 *  - icon         : React element or icon component
 *  - title        : heading text
 *  - description  : subtext
 *  - actionLabel  : CTA button label (optional)
 *  - onAction     : CTA click handler (optional)
 */

import { HiInbox } from 'react-icons/hi2';

export default function EmptyState({
  icon: Icon = HiInbox,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  onAction,
}) {
  // Support both JSX elements (<HiInbox />) and component references (HiInbox)
  const iconElement = typeof Icon === 'function'
    ? <Icon className="w-10 h-10 text-surface-400 dark:text-surface-500" />
    : Icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {/* Large muted icon */}
      <div className="w-20 h-20 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-5">
        {iconElement}
      </div>

      <h3 className="text-lg font-semibold text-surface-800 dark:text-surface-200 mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs mb-6">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="
            px-5 py-2.5 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-primary-600 to-accent-600
            hover:from-primary-500 hover:to-accent-500
            shadow-lg shadow-primary-500/25
            hover:shadow-primary-500/40
            transition-all duration-300
            active:scale-95
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
