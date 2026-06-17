/**
 * Modal — reusable dialog overlay.
 *
 * Props:
 *  - isOpen   : boolean
 *  - onClose  : () => void
 *  - title    : string
 *  - children : content
 *  - size     : 'sm' | 'md' | 'lg'  (default 'md')
 */

import { useEffect, useCallback } from 'react';
import { HiXMark } from 'react-icons/hi2';

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // ── Close on Escape ────────────────────────────────────────
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Card */}
      <div
        className={`
          relative w-full ${SIZE_MAP[size]}
          bg-white dark:bg-surface-800
          rounded-2xl shadow-2xl
          border border-surface-200 dark:border-surface-700
          animate-scale-in
          backdrop-blur-xl
          dark:shadow-black/40
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <HiXMark className="w-5 h-5 text-surface-500" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
