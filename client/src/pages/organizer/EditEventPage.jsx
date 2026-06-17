import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiDocumentText,
  HiCalendarDays,
  HiMapPin,
  HiUserGroup,
  HiPhoto,
  HiTag,
  HiArrowLeft,
  HiPencilSquare,
  HiArrowUpTray,
  HiXMark,
} from 'react-icons/hi2';
import * as eventService from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
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

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [existingPoster, setExistingPoster] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEvent(id);
        const event = res.data?.data;
        if (!event) throw new Error('Not found');

        // Verify ownership
        const organizerId = event.organizer?._id || event.organizer;
        const userId = user?._id || user?.id;
        if (organizerId !== userId && user?.role !== 'admin') {
          showToast('You do not have permission to edit this event', 'error');
          navigate('/organizer/dashboard');
          return;
        }

        const eventDate = event.date ? new Date(event.date) : null;
        const deadlineDate = event.registrationDeadline ? new Date(event.registrationDeadline) : null;

        setForm({
          title: event.title || '',
          description: event.description || '',
          category: event.category || '',
          date: eventDate ? eventDate.toISOString().split('T')[0] : '',
          time: eventDate ? eventDate.toTimeString().slice(0, 5) : '',
          registrationDeadline: deadlineDate ? deadlineDate.toISOString().split('T')[0] : '',
          venue: event.venue || '',
          maxParticipants: event.maxParticipants || '',
        });
        if (event.poster) setExistingPoster(event.poster);
      } catch (err) {
        showToast('Failed to load event', 'error');
        navigate('/organizer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePoster = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoster(file);
      setPosterPreview(URL.createObjectURL(file));
      setExistingPoster(null);
    }
  };

  const removePoster = () => {
    setPoster(null);
    setPosterPreview(null);
    setExistingPoster(null);
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
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) formData.append(key, val);
      });
      if (poster) formData.append('poster', poster);
      if (!existingPoster && !poster) formData.append('removePoster', 'true');
      await eventService.updateEvent(id, formData);
      showToast('Event updated successfully!', 'success');
      navigate('/organizer/dashboard');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-xl border bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      errors[field] ? 'border-red-400 focus:ring-red-300' : 'border-surface-200 dark:border-surface-700 focus:ring-primary-400 focus:border-primary-400'
    }`;

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const currentPreview = posterPreview || existingPoster;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      <div className="bg-gradient-to-r from-accent-600 to-primary-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <HiPencilSquare className="text-xl text-accent-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Event</h1>
              <p className="text-primary-100">Update your event details</p>
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
                <input type="text" name="title" value={form.title} onChange={handleChange} className={inputCls('title')} />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} className={inputCls('description') + ' resize-none'} />
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
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Reg. Deadline</label>
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
                <input type="text" name="venue" value={form.venue} onChange={handleChange} className={inputCls('venue')} />
                {errors.venue && <p className="mt-1 text-sm text-red-500">{errors.venue}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Max Participants *</label>
                <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} min="1" className={inputCls('maxParticipants')} />
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
            {currentPreview ? (
              <div className="relative inline-block">
                <img src={currentPreview} alt="Preview" className="w-full max-w-sm h-48 object-cover rounded-xl border border-surface-200 dark:border-surface-700" />
                <button type="button" onClick={removePoster} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  <HiXMark />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                <HiArrowUpTray className="text-3xl text-surface-400 mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-400">Click to upload poster</p>
                <input type="file" accept="image/*" onChange={handlePoster} className="hidden" />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner size="sm" /> : <><HiPencilSquare /> Update Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
