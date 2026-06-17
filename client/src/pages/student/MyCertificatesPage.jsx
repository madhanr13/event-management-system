import { useState, useEffect } from 'react';
import {
  HiAcademicCap,
  HiArrowDownTray,
  HiCalendarDays,
  HiCheckBadge,
  HiSparkles,
} from 'react-icons/hi2';
import * as certificateService from '../../services/certificateService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function MyCertificatesPage() {
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => { fetchCertificates(); }, []);

  const fetchCertificates = async () => {
    try {
      const res = await certificateService.getMyCertificates();
      setCertificates(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      showToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (cert) => {
    const eventId = cert.event?._id || cert.event;
    setDownloading(eventId);
    try {
      const res = await certificateService.generateCertificate(eventId);
      // If the response is a URL, open in new tab
      const url = res.data?.data?.url || res.data?.data;
      if (typeof url === 'string' && url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        showToast('Certificate generated!', 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Download failed', 'error');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-primary-600 to-accent-600 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/20">
            <HiAcademicCap className="text-yellow-200" />
            <span className="text-white/90 text-sm font-medium">Achievements</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Certificates</h1>
          <p className="text-white/80">Download your event participation certificates</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {certificates.length === 0 ? (
          <EmptyState
            icon={HiAcademicCap}
            title="No certificates yet"
            description="Attend events to earn participation certificates."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert, i) => {
              const event = cert.event || {};
              const eventId = event._id || cert.event;
              const eventDate = event.date ? new Date(event.date) : cert.issuedDate ? new Date(cert.issuedDate) : null;

              return (
                <div
                  key={cert._id || i}
                  className="group bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Certificate visual */}
                  <div className="relative h-36 bg-gradient-to-br from-primary-500 via-accent-500 to-amber-500 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMEwyNSAyMEw0MCAyNUwyMCA0MEwxNSAyMEwwIDE1WiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-20" />
                    <div className="relative text-center">
                      <HiAcademicCap className="text-5xl text-white/90 mx-auto mb-1" />
                      <p className="text-white/80 text-xs font-medium tracking-wider uppercase">Certificate of Participation</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <HiCheckBadge className="text-2xl text-yellow-300" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-surface-900 dark:text-white text-lg mb-2 line-clamp-2">
                      {event.title || 'Event Certificate'}
                    </h3>
                    {eventDate && (
                      <div className="flex items-center gap-1.5 text-sm text-surface-500 dark:text-surface-400 mb-4">
                        <HiCalendarDays className="text-primary-500" />
                        {eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    <button
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === eventId}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-md shadow-primary-500/20 transition-all duration-200 disabled:opacity-60"
                    >
                      {downloading === eventId ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <HiArrowDownTray /> Download Certificate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
