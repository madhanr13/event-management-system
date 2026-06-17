import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiTicket,
  HiCalendarDays,
  HiMapPin,
  HiQrCode,
  HiXMark,
  HiCheckBadge,
  HiClock,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import * as registrationService from '../../services/registrationService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';

const TABS = ['All', 'Upcoming', 'Attended', 'Cancelled'];

const statusConfig = {
  registered: { label: 'Registered', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: HiTicket },
  attended: { label: 'Attended', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: HiCheckBadge },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: HiXMark },
};

export default function MyRegistrationsPage() {
  const { showToast } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedQR, setSelectedQR] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationService.getMyRegistrations();
      setRegistrations(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      showToast('Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Cancelled') return r.status === 'cancelled';
    if (activeTab === 'Attended') return r.status === 'attended';
    if (activeTab === 'Upcoming') {
      const d = new Date(r.event?.date);
      return r.status === 'registered' && d > new Date();
    }
    return true;
  });

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(cancelTarget._id);
      showToast('Registration cancelled', 'info');
      setCancelTarget(null);
      fetchRegistrations();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Cancel failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">My Registrations</h1>
          <p className="text-primary-100">Track all your event registrations and attendance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState icon={HiTicket} title="No registrations" description={`No ${activeTab.toLowerCase()} registrations found.`} />
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => {
              const event = reg.event || {};
              const status = statusConfig[reg.status] || statusConfig.registered;
              const eventDate = event.date ? new Date(event.date) : null;

              return (
                <div key={reg._id} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  <div className="flex flex-col sm:flex-row">
                    {/* Poster */}
                    <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                      {event.poster ? (
                        <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center min-h-[8rem]">
                          <HiCalendarDays className="text-3xl text-white/80" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                            <status.icon className="text-xs" />
                            {status.label}
                          </span>
                        </div>
                        <Link to={`/student/events/${event._id}`} className="text-lg font-bold text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {event.title || 'Untitled Event'}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-surface-500 dark:text-surface-400">
                          {eventDate && (
                            <span className="flex items-center gap-1">
                              <HiCalendarDays className="text-primary-500" />
                              {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                          {event.venue && (
                            <span className="flex items-center gap-1">
                              <HiMapPin className="text-accent-500" />
                              {event.venue}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {reg.status === 'registered' && (
                          <>
                            <button
                              onClick={() => setSelectedQR(reg)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                            >
                              <HiQrCode /> QR Code
                            </button>
                            <button
                              onClick={() => setCancelTarget(reg)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <HiXMark /> Cancel
                            </button>
                          </>
                        )}
                        {reg.status === 'attended' && (
                          <Link
                            to={`/student/feedback/${event._id}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/30 border border-accent-200 dark:border-accent-800 hover:bg-accent-100 dark:hover:bg-accent-900/50 transition-colors"
                          >
                            Give Feedback
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <Modal onClose={() => setSelectedQR(null)} title="Attendance QR Code">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-56 h-56 bg-white rounded-2xl border-2 border-dashed border-surface-300 mb-4">
              {selectedQR.qrCode ? (
                <img src={selectedQR.qrCode} alt="QR" className="w-48 h-48 object-contain" />
              ) : (
                <div>
                  <HiQrCode className="text-7xl text-surface-400 mx-auto mb-2" />
                  <p className="text-xs text-surface-500 break-all px-4">{selectedQR.qrToken || selectedQR._id}</p>
                </div>
              )}
            </div>
            <p className="font-semibold text-surface-900 dark:text-white">{selectedQR.event?.title}</p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Present this QR code at the event venue</p>
          </div>
        </Modal>
      )}

      {/* Cancel Dialog */}
      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Registration"
          message={`Are you sure you want to cancel your registration for "${cancelTarget.event?.title}"?`}
          confirmText="Cancel Registration"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelling}
          variant="danger"
        />
      )}
    </div>
  );
}
