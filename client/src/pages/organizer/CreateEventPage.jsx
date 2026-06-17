import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiDocumentText,
  HiCalendarDays,
  HiMapPin,
  HiUserGroup,
  HiPhoto,
  HiTag,
  HiClock,
  HiArrowLeft,
  HiSparkles,
  HiArrowUpTray,
  HiXMark,
} from 'react-icons/hi2';
import * as eventService from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Technical' },
  { value: 'other', label: 'Other' },
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    registrationDeadline: '',
    venue: '',
    maxParticipants: '',
  });
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePoster = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const removePoster = () => {
    setPoster(null);
    setPosterPreview(null);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.category) e.category = 'Category is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.venue.trim()) e.venue = 'Venue is required';
    if (!form.maxParticipants || Number(form.maxParticipants) < 1) e.maxParticipants = 'Must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      if (poster) formData.append('poster', poster);
      await eventService.createEvent(formData);
      showToast('Event created successfully!', 'success');
      navigate('/organizer/dashboard');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      errors[field] ? 'border-red-400 focus:ring-red-300' : 'border-surface-200 dark:border-surface-700 focus:ring-primary-400 focus:border-primary-400'
    }`;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <HiSparkles className="text-xl text-accent-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Event</h1>
              <p className="text-primary-100">Set up a new campus event for students</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HiDocumentText className="text-xl text-primary-500" />
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Event Title *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g., Annual Tech Fest 2026" className={inputCls('title')} />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe your event in detail..." className={inputCls('description') + ' resize-none'} />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Category *</label>
                <div className="relative">
                  <HiTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <select name="category" value={form.category} onChange={handleChange} className={`pl-10 ${inputCls('category')} appearance-none`}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HiCalendarDays className="text-xl text-accent-500" />
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Schedule</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date *</label>
                <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls('date')} />
                {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Time</label>
                <input type="time" name="time" value={form.time} onChange={handleChange} className={inputCls('time')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Registration Deadline</label>
                <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className={inputCls('registrationDeadline')} />
              </div>
            </div>
          </div>

          {/* Location & Capacity */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HiMapPin className="text-xl text-emerald-500" />
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Location & Capacity</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Venue *</label>
                <div className="relative">
                  <HiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="text" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g., Main Auditorium" className={`pl-10 ${inputCls('venue')}`} />
                </div>
                {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Max Participants *</label>
                <div className="relative">
                  <HiUserGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} placeholder="100" min="1" className={`pl-10 ${inputCls('maxParticipants')}`} />
                </div>
                {errors.maxParticipants && <p className="mt-1 text-sm text-red-500">{errors.maxParticipants}</p>}
              </div>
            </div>
          </div>

          {/* Poster */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HiPhoto className="text-xl text-amber-500" />
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">Event Poster</h2>
            </div>
            {posterPreview ? (
              <div className="relative inline-block">
                <img src={posterPreview} alt="Preview" className="w-full max-w-sm h-48 object-cover rounded-xl border border-surface-200 dark:border-surface-700" />
                <button type="button" onClick={removePoster} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <HiXMark />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                <HiArrowUpTray className="text-3xl text-surface-400 mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-400">Click to upload poster</p>
                <p className="text-xs text-surface-400 mt-1">PNG, JPG up to 5MB</p>
                <input type="file" accept="image/*" onChange={handlePoster} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : <><HiSparkles /> Create Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
