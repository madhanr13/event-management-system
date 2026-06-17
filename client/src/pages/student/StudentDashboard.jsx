import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiTicket,
  HiCheckBadge,
  HiAcademicCap,
  HiArrowRight,
  HiSparkles,
  HiMagnifyingGlass,
  HiClipboardDocumentList,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as eventService from '../../services/eventService';
import * as registrationService from '../../services/registrationService';
import * as certificateService from '../../services/certificateService';
import * as attendanceService from '../../services/attendanceService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/common/EventCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ events: 0, registrations: 0, attended: 0, certificates: 0 });
  const [recentRegistrations, setRecentRegistrations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, regsRes, attendRes, certsRes] = await Promise.allSettled([
        eventService.getEvents({ status: 'upcoming' }),
        registrationService.getMyRegistrations(),
        attendanceService.getMyAttendance(),
        certificateService.getMyCertificates(),
      ]);

      const events = eventsRes.status === 'fulfilled' ? eventsRes.value.data?.data : [];
      const regs = regsRes.status === 'fulfilled' ? regsRes.value.data?.data : [];
      const attended = attendRes.status === 'fulfilled' ? attendRes.value.data?.data : [];
      const certs = certsRes.status === 'fulfilled' ? certsRes.value.data?.data : [];

      setStats({
        events: Array.isArray(events) ? events.length : (events?.totalEvents || 0),
        registrations: Array.isArray(regs) ? regs.length : 0,
        attended: Array.isArray(attended) ? attended.length : 0,
        certificates: Array.isArray(certs) ? certs.length : 0,
      });

      const regList = Array.isArray(regs) ? regs : [];
      setRecentRegistrations(regList.slice(0, 5));
    } catch {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Upcoming Events', value: stats.events, icon: HiCalendarDays, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
    { label: 'My Registrations', value: stats.registrations, icon: HiTicket, color: 'from-accent-500 to-accent-600', bg: 'bg-accent-50 dark:bg-accent-900/30', text: 'text-accent-600 dark:text-accent-400' },
    { label: 'Events Attended', value: stats.attended, icon: HiCheckBadge, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Certificates', value: stats.certificates, icon: HiAcademicCap, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/20">
            <HiSparkles className="text-accent-300" />
            <span className="text-white/90 text-sm font-medium">Student Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Stay up to date with your events, registrations, and achievements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="group bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/60 shadow-lg shadow-surface-200/20 dark:shadow-surface-900/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon className={`text-xl ${card.text}`} />
                </div>
                <span className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                  {card.value}
                </span>
              </div>
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Link
            to="/student/events"
            className="group flex items-center gap-4 bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
              <HiMagnifyingGlass className="text-xl text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-surface-900 dark:text-white">Browse Events</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Discover and join campus events</p>
            </div>
            <HiArrowRight className="text-surface-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </Link>
          <Link
            to="/student/registrations"
            className="group flex items-center gap-4 bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 hover:border-accent-300 dark:hover:border-accent-600 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="p-3 rounded-xl bg-accent-50 dark:bg-accent-900/30 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors">
              <HiClipboardDocumentList className="text-xl text-accent-600 dark:text-accent-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-surface-900 dark:text-white">My Registrations</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">View your event registrations</p>
            </div>
            <HiArrowRight className="text-surface-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Recent Registrations */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">Recent Registrations</h2>
            <Link to="/student/registrations" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
              View all <HiArrowRight className="text-sm" />
            </Link>
          </div>
          {recentRegistrations.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-10 text-center">
              <HiTicket className="text-5xl text-surface-300 dark:text-surface-600 mx-auto mb-3" />
              <p className="text-surface-500 dark:text-surface-400 font-medium">No registrations yet</p>
              <p className="text-sm text-surface-400 dark:text-surface-500 mt-1">Browse events and register to get started!</p>
              <Link to="/student/events" className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
                Browse Events <HiArrowRight />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentRegistrations.map((reg) => (
                <EventCard key={reg._id} event={reg.event || reg} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
