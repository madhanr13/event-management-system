import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiUserGroup,
  HiMagnifyingGlass,
  HiArrowDownTray,
  HiArrowLeft,
  HiCheckBadge,
  HiClock,
  HiEnvelope,
  HiBuildingLibrary,
} from 'react-icons/hi2';
import * as registrationService from '../../services/registrationService';
import * as eventService from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function EventParticipantsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchData(); }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, regsRes] = await Promise.all([
        eventService.getEvent(eventId),
        registrationService.getEventRegistrations(eventId),
      ]);
      setEvent(eventRes.data?.data);
      setParticipants(Array.isArray(regsRes.data?.data) ? regsRes.data.data : []);
    } catch {
      showToast('Failed to load participants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = participants.filter((p) => {
    const name = p.user?.name || p.student?.name || '';
    const email = p.user?.email || p.student?.email || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  const totalRegistered = participants.length;
  const totalAttended = participants.filter((p) => p.status === 'attended').length;
  const totalPending = participants.filter((p) => p.status === 'registered').length;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await registrationService.exportParticipants(eventId);
      // Handle CSV blob or URL
      if (res.data instanceof Blob) {
        const url = URL.createObjectURL(res.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participants_${eventId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const csvUrl = res.data?.data?.url || res.data?.data;
        if (typeof csvUrl === 'string') window.open(csvUrl, '_blank');
      }
      showToast('Export successful!', 'success');
    } catch {
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-primary-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">Event Participants</h1>
          {event && <p className="text-emerald-100 text-lg">{event.title}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Registered', value: totalRegistered, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/30' },
            { label: 'Attended', value: totalAttended, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
            { label: 'Pending', value: totalPending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          ].map((s) => (
            <div key={s.label} className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/60 shadow-lg text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {exporting ? <LoadingSpinner size="sm" /> : <><HiArrowDownTray /> Export CSV</>}
          </button>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState icon={HiUserGroup} title="No participants" description="No one has registered for this event yet." />
        ) : (
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Department</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Registered</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                  {filtered.map((p, i) => {
                    const u = p.user || p.student || {};
                    const isAttended = p.status === 'attended';
                    return (
                      <tr key={p._id} className={`hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${i % 2 === 0 ? '' : 'bg-surface-50/50 dark:bg-surface-900/30'}`}>
                        <td className="px-5 py-3.5 text-sm text-surface-500 dark:text-surface-400">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                              {(u.name || '?')[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-surface-900 dark:text-white text-sm">{u.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-surface-600 dark:text-surface-400">{u.email || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-surface-600 dark:text-surface-400">{u.department || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-surface-500 dark:text-surface-400">
                          {p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isAttended ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {isAttended ? <HiCheckBadge /> : <HiClock />}
                            {isAttended ? 'Attended' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
