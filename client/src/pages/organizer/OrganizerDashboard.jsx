import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiUserGroup,
  HiCheckBadge,
  HiStar,
  HiPlus,
  HiArrowRight,
  HiSparkles,
  HiEye,
  HiPencilSquare,
  HiChartBarSquare,
  HiQrCode,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as eventService from '../../services/eventService';
import * as registrationService from '../../services/registrationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, registrations: 0, attended: 0, avgRating: 0 });
  const [events, setEvents] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await eventService.getEvents({ organizer: user?._id || user?.id });
      const evts = Array.isArray(res.data?.data) ? res.data.data : (res.data?.data?.events || []);
      setEvents(evts);

      let totalRegs = 0, totalAttended = 0, totalRating = 0, ratedEvents = 0;
      evts.forEach((e) => {
        totalRegs += e.currentParticipants || 0;
        totalAttended += e.attendedCount || 0;
        if (e.averageRating) { totalRating += e.averageRating; ratedEvents++; }
      });

      setStats({
        events: evts.length,
        registrations: totalRegs,
        attended: totalAttended,
        avgRating: ratedEvents > 0 ? (totalRating / ratedEvents).toFixed(1) : '—',
      });
    } catch {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Events', value: stats.events, icon: HiCalendarDays, bg: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400', gradient: 'from-primary-500 to-primary-600' },
    { label: 'Total Registrations', value: stats.registrations, icon: HiUserGroup, bg: 'bg-accent-50 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400', gradient: 'from-accent-500 to-accent-600' },
    { label: 'Total Attended', value: stats.attended, icon: HiCheckBadge, bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Avg Rating', value: stats.avgRating, icon: HiStar, bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', gradient: 'from-amber-500 to-amber-600' },
  ];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-accent-600 via-primary-700 to-primary-800 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/20">
              <HiSparkles className="text-accent-300" />
              <span className="text-white/90 text-sm font-medium">Organizer Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Welcome, {user?.name?.split(' ')[0] || 'Organizer'}! 🎉
            </h1>
            <p className="text-primary-100 text-lg">Manage your events and track engagement</p>
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <HiPlus className="text-lg" /> Create Event
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/60 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon className={`text-xl ${card.text}`} />
                </div>
                <span className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Your Events</h2>
          </div>
          {events.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-10 text-center">
              <HiCalendarDays className="text-5xl text-surface-300 dark:text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 dark:text-surface-400 font-medium">No events created yet</p>
              <Link to="/organizer/events/create" className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                <HiPlus /> Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => {
                const date = event.date ? new Date(event.date) : null;
                return (
                  <div key={event._id} className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 hover:shadow-md transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Poster mini */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-400 to-accent-500">
                        {event.poster ? (
                          <img src={event.poster} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HiCalendarDays className="text-white/80" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-surface-900 dark:text-white truncate">{event.title}</h3>
                        <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-surface-400 mt-1">
                          {date && <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          <span>{event.currentParticipants || 0} / {event.maxParticipants || '∞'} registered</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs capitalize">{event.category || 'general'}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/student/events/${event._id}`} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all" title="View">
                          <HiEye />
                        </Link>
                        <Link to={`/organizer/events/${event._id}/edit`} className="p-2 rounded-lg text-surface-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/30 transition-all" title="Edit">
                          <HiPencilSquare />
                        </Link>
                        <Link to={`/organizer/events/${event._id}/participants`} className="p-2 rounded-lg text-surface-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all" title="Participants">
                          <HiUserGroup />
                        </Link>
                        <Link to={`/organizer/events/${event._id}/scan`} className="p-2 rounded-lg text-surface-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Scan QR">
                          <HiQrCode />
                        </Link>
                        <Link to={`/organizer/events/${event._id}/feedback`} className="p-2 rounded-lg text-surface-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all" title="Feedback">
                          <HiChartBarSquare />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
