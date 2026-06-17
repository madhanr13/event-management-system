/**
 * ToastContext — lightweight toast notification system.
 *
 * Features:
 *  - 4 types: success · error · info · warning
 *  - Auto-dismiss after 4 seconds
 *  - Beautiful glassmorphism cards with slide-in animation
 *  - Manual dismiss via × button
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXCircle,
  HiXMark,
} from 'react-icons/hi2';

const ToastContext = createContext(null);

/* ── Icon + colour map per toast type ─────────────────────── */
const TOAST_CONFIG = {
  success: {
    icon: HiCheckCircle,
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: HiXCircle,
    bg: 'bg-red-500/15 dark:bg-red-500/20',
    border: 'border-red-500/30',
    iconColor: 'text-red-500',
    bar: 'bg-red-500',
  },
  info: {
    icon: HiInformationCircle,
    bg: 'bg-blue-500/15 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-500',
    bar: 'bg-blue-500',
  },
  warning: {
    icon: HiExclamationTriangle,
    bg: 'bg-amber-500/15 dark:bg-amber-500/20',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-500',
    bar: 'bg-amber-500',
  },
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  /** Add a toast. */
  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId;

    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Auto-remove after 4 s (with exit animation)
    timersRef.current[id] = setTimeout(() => {
      dismissToast(id);
    }, 4000);

    return id;
  }, []);

  /** Start exit animation, then remove from state. */
  const dismissToast = useCallback((id) => {
    // Mark as exiting so the CSS exit animation plays
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)),
    );

    // Remove from DOM after animation finishes (250 ms)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }, 250);
  }, []);

  const removeToast = dismissToast;

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* ── Toast container — fixed bottom-right ── */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info;
          const Icon = config.icon;

          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto relative overflow-hidden
                flex items-start gap-3 px-4 py-3 rounded-xl
                backdrop-blur-xl border shadow-xl
                ${config.bg} ${config.border}
                ${toast.exiting ? 'toast-exit' : 'toast-enter'}
                dark:shadow-black/30
              `}
            >
              {/* Accent bar on left */}
              <span
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${config.bar}`}
              />

              {/* Icon */}
              <Icon className={`mt-0.5 flex-shrink-0 w-5 h-5 ${config.iconColor}`} />

              {/* Message */}
              <p className="flex-1 text-sm font-medium text-surface-800 dark:text-surface-100">
                {toast.message}
              </p>

              {/* Close button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-0.5 rounded-lg hover:bg-surface-200/60 dark:hover:bg-surface-700/60 transition-colors"
              >
                <HiXMark className="w-4 h-4 text-surface-500" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Custom hook — use inside any component to trigger toasts.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Saved!', 'success');
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;
