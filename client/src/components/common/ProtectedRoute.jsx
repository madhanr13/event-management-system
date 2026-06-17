/**
 * ProtectedRoute — guards routes by auth state and user role.
 *
 * Props:
 *  - children : JSX to render when authorised
 *  - roles    : string[] of allowed roles (e.g. ['student', 'admin'])
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Still loading auth state — show spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Checking authentication…" />
      </div>
    );
  }

  // Not logged in — redirect to login (preserve intended destination)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role — show unauthorized
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-6xl">🚫</div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
          Access Denied
        </h2>
        <p className="text-surface-500 dark:text-surface-400">
          You don&apos;t have permission to view this page.
        </p>
        <Navigate to={`/${user?.role}/dashboard`} replace />
      </div>
    );
  }

  return children;
}
