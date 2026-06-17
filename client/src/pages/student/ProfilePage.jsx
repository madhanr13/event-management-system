import { useState, useEffect } from 'react';
import {
  HiPencilSquare,
  HiCheck,
  HiXMark,
  HiEnvelope,
  HiUser,
  HiBuildingLibrary,
  HiPhone,
  HiShieldCheck,
  HiCalendarDays,
  HiTicket,
  HiAcademicCap,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as registrationService from '../../services/registrationService';
import * as certificateService from '../../services/certificateService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', department: '', phone: '' });
  const [stats, setStats] = useState({ registrations: 0, certificates: 0 });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', department: user.department || '', phone: user.phone || '' });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [regsRes, certsRes] = await Promise.allSettled([
        registrationService.getMyRegistrations(),
        certificateService.getMyCertificates(),
      ]);
      setStats({
        registrations: regsRes.status === 'fulfilled' ? (Array.isArray(regsRes.value.data?.data) ? regsRes.value.data.data.length : 0) : 0,
        certificates: certsRes.status === 'fulfilled' ? (Array.isArray(certsRes.value.data?.data) ? certsRes.value.data.data.length : 0) : 0,
      });
    } catch {
      /* silent */
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      showToast('Profile updated successfully', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', department: user?.department || '', phone: user?.phone || '' });
    setEditing(false);
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleBadge = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    organizer: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400',
    student: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 px-4 sm:px-6 lg:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-xl">
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
            <p className="text-primary-100">{user?.email}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${roleBadge[user?.role] || roleBadge.student}`}>
              {(user?.role || 'student').charAt(0).toUpperCase() + (user?.role || 'student').slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/60 shadow-lg text-center">
            <HiTicket className="text-2xl text-primary-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.registrations}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Registrations</p>
          </div>
          <div className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/60 shadow-lg text-center">
            <HiAcademicCap className="text-2xl text-accent-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stats.certificates}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">Certificates</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">Profile Information</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
                <HiPencilSquare /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <HiXMark /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {saving ? <LoadingSpinner size="sm" /> : <><HiCheck /> Save</>}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                <HiUser className="text-primary-500" />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Full Name</span>
              </div>
              {editing ? (
                <input type="text" name="name" value={form.name} onChange={handleChange} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              ) : (
                <span className="text-surface-900 dark:text-white font-medium">{user?.name}</span>
              )}
            </div>

            {/* Email (non-editable) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                <HiEnvelope className="text-primary-500" />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Email</span>
              </div>
              <span className="text-surface-900 dark:text-white font-medium">{user?.email}</span>
              {editing && <span className="text-xs text-surface-400 ml-2">(cannot change)</span>}
            </div>

            {/* Role (non-editable) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                <HiShieldCheck className="text-primary-500" />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Role</span>
              </div>
              <span className="text-surface-900 dark:text-white font-medium capitalize">{user?.role}</span>
            </div>

            {/* Department */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                <HiBuildingLibrary className="text-primary-500" />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Department</span>
              </div>
              {editing ? (
                <input type="text" name="department" value={form.department} onChange={handleChange} className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              ) : (
                <span className="text-surface-900 dark:text-white font-medium">{user?.department || '—'}</span>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2 sm:w-40 flex-shrink-0">
                <HiPhone className="text-primary-500" />
                <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Phone</span>
              </div>
              {editing ? (
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
              ) : (
                <span className="text-surface-900 dark:text-white font-medium">{user?.phone || '—'}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
