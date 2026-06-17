import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiAcademicCap,
  HiArrowRight,
  HiSparkles,
  HiUserPlus,
  HiBuildingLibrary,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.department.trim()) e.department = 'Department is required';
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
      const { confirmPassword, ...data } = form;
      const res = await register(data);
      const role = res?.data?.role || res?.user?.role || form.role;
      showToast('Account created successfully! Welcome aboard.', 'success');
      const dest = role === 'admin' ? '/admin/dashboard' : role === 'organizer' ? '/organizer/dashboard' : '/student/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (field) =>
    `w-full pl-11 pr-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-surface-200 dark:border-surface-700 focus:ring-primary-400 focus:border-primary-400'
    }`;

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-accent-600 via-primary-700 to-primary-900 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent-300 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-8 border border-white/20">
            <HiUserPlus className="text-accent-300 text-lg" />
            <span className="text-white/90 text-sm font-medium">Join the Community</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Campus Event Journey
          </h1>
          <p className="text-lg text-primary-100 leading-relaxed">
            Create your account to register for events, track attendance, earn certificates, and connect with your campus community.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: HiAcademicCap, text: 'Students' },
              { icon: HiSparkles, text: 'Organizers' },
              { icon: HiBuildingLibrary, text: 'Departments' },
            ].map((item) => (
              <div key={item.text} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <item.icon className="text-2xl text-accent-300 mx-auto mb-2" />
                <p className="text-xs text-white/80">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 rounded-full px-4 py-1.5 mb-4">
              <HiSparkles className="text-primary-500 text-sm" />
              <span className="text-primary-700 dark:text-primary-300 text-xs font-medium">Event Management</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Create account</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8">Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Full Name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClasses('name')} />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email Address</label>
              <div className="relative">
                <HiEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" className={inputClasses('email')} />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={inputClasses('password')} />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClasses('confirmPassword')} />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Role + Department row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Role</label>
                <div className="relative">
                  <HiAcademicCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 appearance-none"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Department</label>
                <div className="relative">
                  <HiBuildingLibrary className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-lg" />
                  <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="Computer Science" className={inputClasses('department')} />
                </div>
                {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-surface-900 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-accent-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Create Account
                  <HiArrowRight className="text-lg" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
