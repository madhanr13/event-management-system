import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiUsers, HiCalendarDays, HiTicket, HiCheckBadge, HiChartPie, HiChartBar } from 'react-icons/hi2';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          showToast(res.message, 'error');
        }
      } catch (err) {
        showToast('Failed to load admin dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  if (loading) return <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!data) return <EmptyState icon={<HiChartPie />} title="No Data" description="Could not load dashboard data." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-primary-100 max-w-xl">System overview and analytics.</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <HiChartPie className="w-48 h-48" />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<HiUsers />} title="Total Users" value={data.totalUsers} color="from-blue-500 to-cyan-500" />
        <StatCard icon={<HiCalendarDays />} title="Total Events" value={data.totalEvents} color="from-purple-500 to-fuchsia-500" />
        <StatCard icon={<HiTicket />} title="Registrations" value={data.totalRegistrations} color="from-amber-500 to-orange-500" />
        <StatCard icon={<HiCheckBadge />} title="Attendance" value={data.totalAttendance} color="from-emerald-500 to-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
            <HiUsers className="text-primary-500" /> Users by Role
          </h2>
          <div className="space-y-4">
            {data.usersByRole?.map(role => (
              <div key={role._id}>
                <div className="flex justify-between text-sm mb-1 text-surface-700 dark:text-surface-300">
                  <span className="capitalize">{role._id}</span>
                  <span className="font-semibold">{role.count}</span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min((role.count / data.totalUsers) * 100, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events by Category */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-4 flex items-center gap-2">
            <HiChartBar className="text-accent-500" /> Events by Category
          </h2>
          <div className="space-y-4">
            {data.eventsByCategory?.map(cat => (
              <div key={cat._id}>
                <div className="flex justify-between text-sm mb-1 text-surface-700 dark:text-surface-300">
                  <span className="capitalize">{cat._id}</span>
                  <span className="font-semibold">{cat.count}</span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                  <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${Math.min((cat.count / data.totalEvents) * 100, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        <div className="w-8 h-8 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</p>
        <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">{value}</p>
      </div>
    </div>
  );
}
