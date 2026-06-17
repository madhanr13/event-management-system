/**
 * ConfirmDialog — destructive-action confirmation modal.
 *
 * Props:
 *  - isOpen       : boolean
 *  - onClose      : () => void
 *  - onConfirm    : () => void
 *  - title        : string
 *  - message      : string
 *  - confirmText  : string (default 'Confirm')
 *  - variant      : 'danger' | 'warning' (default 'danger')
 */

import { useEffect, useCallback } from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

const VARIANT_STYLES = {
  danger: {
    icon: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
    button:
      'bg-red-600 hover:bg-red-700 focus:ring-red-500/40 text-white',
  },
  warning: {
    icon: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    button:
      'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/40 text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  variant = 'danger',
}) {
  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.danger;

  // Escape to close
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div className="relative w-full max-w-md bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 animate-scale-in dark:shadow-black/40">
        <div className="p-6 text-center">
          {/* Warning icon */}
          <div
            className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${styles.icon}`}
          >
            <HiExclamationTriangle className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
            {title}
          </h3>

          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="
                px-5 py-2.5 rounded-xl text-sm font-medium
                bg-surface-100 dark:bg-surface-700
                text-surface-700 dark:text-surface-300
                hover:bg-surface-200 dark:hover:bg-surface-600
                transition-colors duration-200
              "
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-semibold
                shadow-lg transition-all duration-200
                focus:outline-none focus:ring-2
                active:scale-95
                ${styles.button}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
