/**
 * LoadingSpinner — a centered, animated loading indicator.
 *
 * Props:
 *  - size   : 'sm' | 'md' | 'lg'  (default 'md')
 *  - text   : optional label under the spinner
 *  - className : extra wrapper classes
 */

const SIZE_MAP = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
};

export default function LoadingSpinner({ size = 'md', text, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Gradient ring spinner */}
      <div className="relative">
        <div
          className={`
            ${SIZE_MAP[size]}
            rounded-full
            border-surface-200 dark:border-surface-700
            border-t-primary-500 border-r-accent-500
            animate-spin
          `}
        />
        {/* Soft glow behind the spinner */}
        <div
          className={`
            absolute inset-0
            ${SIZE_MAP[size]}
            rounded-full
            bg-gradient-to-r from-primary-500/20 to-accent-500/20
            blur-md -z-10
          `}
        />
      </div>

      {text && (
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400 animate-pulse-soft">
          {text}
        </p>
      )}
    </div>
  );
}
