import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as eventService from '../../services/eventService';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { HiCalendarDays, HiTrash, HiEye } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

export default function ManageEventsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '' });
  
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, eventId: null });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = {};
      if (filters.search) query.search = filters.search;
      
      const res = await eventService.getEvents(query);
      if (res.success) {
        setEvents(res.data.events || res.data);
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const handleDeleteEvent = async () => {
    try {
      const res = await adminService.deleteEvent(deleteDialog.eventId);
      if (res.success) {
        showToast('Event deleted successfully', 'success');
        setEvents(events.filter(e => e._id !== deleteDialog.eventId));
      } else {
        showToast(res.message, 'error');
      }
    } catch (err) {
      showToast('Failed to delete event', 'error');
    } finally {
      setDeleteDialog({ isOpen: false, eventId: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
            <HiCalendarDays className="text-primary-500" /> Manage Events
          </h1>
          <p className="text-surface-500 dark:text-surface-400">View and remove events across the system.</p>
        </div>
      </div>

      <div className="glass dark:glass-dark rounded-2xl p-4 shadow-sm border border-surface-200 dark:border-surface-800">
        <div className="mb-6">
           <input
             type="text"
             placeholder="Search events by title..."
             className="w-full sm:max-w-md px-4 py-2 bg-surface-50 dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-surface-900 dark:text-surface-100"
             value={filters.search}
             onChange={(e) => setFilters({ search: e.target.value })}
           />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner /></div>
        ) : events.length === 0 ? (
          <EmptyState icon={<HiCalendarDays />} title="No Events Found" description="Try adjusting your search filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 text-sm">
                  <th className="py-3 px-4 font-semibold">Event</th>
                  <th className="py-3 px-4 font-semibold">Organizer</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Participants</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-surface-900 dark:text-surface-100">{event.title}</div>
                      <div className="text-sm text-surface-500 dark:text-surface-400">
                        {new Date(event.date).toLocaleDateString()} at {event.venue}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300">
                      {event.organizer?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border
                        ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : ''}
                        ${event.status === 'ongoing' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                        ${event.status === 'completed' ? 'bg-surface-100 text-surface-700 border-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700' : ''}
                        ${event.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}
                      `}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-surface-700 dark:text-surface-300">
                      {event.currentParticipants} / {event.maxParticipants}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/student/events/${event._id}`}
                        className="inline-block p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="View Event"
                      >
                        <HiEye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, eventId: event._id })}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, eventId: null })}
        onConfirm={handleDeleteEvent}
        title="Delete Event"
        message="Are you sure you want to delete this event? This will also remove all registrations and attendance records associated with it."
        confirmText="Delete Event"
        variant="danger"
      />
    </div>
  );
}
