import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import * as adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiDocumentChartBar, HiPrinter } from 'react-icons/hi2';

export default function ReportsPage() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await adminService.getReports();
        if (res.success) {
          setData(res.data);
        } else {
          showToast(res.message, 'error');
        }
      } catch (err) {
        showToast('Failed to load reports', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [showToast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-12 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!data) return <EmptyState icon={<HiDocumentChartBar />} title="No Reports" description="Could not generate report data." />;

  return (
    <div className="space-y-6 animate-fade-in print:text-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-200 dark:border-surface-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2 print:text-black">
            <HiDocumentChartBar className="text-primary-500 print:hidden" /> System Reports
          </h1>
          <p className="text-surface-500 dark:text-surface-400 print:text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 px-4 py-2 bg-surface-200 hover:bg-surface-300 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-900 dark:text-surface-100 rounded-xl transition-colors font-medium"
        >
          <HiPrinter /> Print Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-8">
        
        {/* Events by Month */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 print:shadow-none print:border-gray-300">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-6 print:text-black">Events Created per Month</h2>
          <div className="space-y-4">
            {data.eventsByMonth?.length === 0 ? <p className="text-sm text-surface-500">No data available.</p> : null}
            {data.eventsByMonth?.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 text-surface-700 dark:text-surface-300 print:text-gray-800">
                  <span>Month {item._id}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(item.count * 10, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registrations by Month */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 print:shadow-none print:border-gray-300">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-6 print:text-black">Registrations per Month</h2>
          <div className="space-y-4">
            {data.registrationsByMonth?.length === 0 ? <p className="text-sm text-surface-500">No data available.</p> : null}
            {data.registrationsByMonth?.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 text-surface-700 dark:text-surface-300 print:text-gray-800">
                  <span>Month {item._id}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                  <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${Math.min(item.count * 5, 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 print:shadow-none print:border-gray-300">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-6 print:text-black">Most Popular Categories</h2>
          <div className="space-y-4">
             {data.popularCategories?.length === 0 ? <p className="text-sm text-surface-500">No data available.</p> : null}
             {data.popularCategories?.map((item, i) => {
               const maxCount = Math.max(...data.popularCategories.map(c => c.count), 1);
               return (
                 <div key={i}>
                  <div className="flex justify-between text-sm mb-1 text-surface-700 dark:text-surface-300 print:text-gray-800">
                    <span className="capitalize">{item._id}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <div className="w-full bg-surface-200 dark:bg-surface-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
                  </div>
                </div>
               );
             })}
          </div>
        </div>

        {/* Top Events */}
        <div className="glass dark:glass-dark rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-800 print:shadow-none print:border-gray-300">
          <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 mb-4 print:text-black">Top Events by Registration</h2>
          <div className="space-y-3 mt-4">
             {data.topEvents?.length === 0 ? <p className="text-sm text-surface-500">No data available.</p> : null}
             {data.topEvents?.map((event, i) => (
                <div key={event._id} className="flex justify-between items-center p-3 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800 print:border-gray-200">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                       {i + 1}
                     </div>
                     <div>
                       <p className="font-medium text-surface-900 dark:text-surface-100 text-sm print:text-black">{event.title}</p>
                       <p className="text-xs text-surface-500 dark:text-surface-400 print:text-gray-600">Capacity: {event.maxParticipants}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-primary-600 dark:text-primary-400 text-lg print:text-black">{event.currentParticipants}</p>
                     <p className="text-xs text-surface-500 dark:text-surface-400 print:text-gray-600">Registered</p>
                   </div>
                </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}
