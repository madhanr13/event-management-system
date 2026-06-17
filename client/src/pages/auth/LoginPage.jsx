import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEnvelope, HiLockClosed, HiArrowRight, HiSparkles } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      const role = res?.data?.role || res?.user?.role || 'student';
      showToast('Welcome back! Login successful.', 'success');
      const dest = role === 'admin' ? '/admin/dashboard' : role === 'organizer' ? '/organizer/dashboard' : '/student/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-8 border border-white/20">
            <HiSparkles className="text-accent-300 text-lg" />
            <span className="text-white/90 text-sm font-medium">College Event Management</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Discover &amp; Join Amazing Campus Events
          </h1>
          <p className="text-lg text-primary-100 leading-relaxed">
            Browse upcoming events, register seamlessly, track attendance, and download certificates — all in one beautiful platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            {[
              { label: 'Events', value: '200+' },
              { label: 'Students', value: '5K+' },
              { label: 'Certificates', value: '3K+' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-primary-200 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1.5 mb-4">
              <HiSparkles className="text-primary-500 text-sm" />
              <span className="text-primary-700 dark:text-primary-300 text-xs font-medium">Event Management</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email Address</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@college.edu"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-surface-200 dark:border-surface-700 focus:ring-primary-400 focus:border-primary-400'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-surface-200 dark:border-surface-700 focus:ring-primary-400 focus:border-primary-400'
                  }`}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-surface-900 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Sign In
                  <HiArrowRight className="text-lg" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
