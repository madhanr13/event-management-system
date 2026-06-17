import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiQrCode,
  HiArrowLeft,
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiUserCircle,
  HiClock,
  HiCommandLine,
} from 'react-icons/hi2';
import * as attendanceService from '../../services/attendanceService';
import * as eventService from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function QRScannerPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [manualToken, setManualToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await eventService.getEvent(eventId);
        setEvent(res.data?.data);
      } catch {
        showToast('Failed to load event', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    return () => {
      if (scannerInstanceRef.current) {
        try { scannerInstanceRef.current.clear(); } catch {}
      }
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    setResult(null);
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      if (scannerInstanceRef.current) {
        try { scannerInstanceRef.current.clear(); } catch {}
      }
      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      });
      scannerInstanceRef.current = scanner;
      scanner.render(
        async (decodedText) => {
          try { scanner.clear(); } catch {}
          setScanning(false);
          await verifyToken(decodedText);
        },
        (error) => {
          // Ignore scan errors during scanning
        }
      );
    } catch (err) {
      showToast('Failed to start QR scanner', 'error');
      setScanning(false);
    }
  };

  const verifyToken = async (token) => {
    setVerifying(true);
    setResult(null);
    try {
      const res = await attendanceService.verifyAttendance({ qrToken: token, eventId });
      const data = res.data?.data;
      const entry = {
        token: token.slice(0, 12) + '...',
        name: data?.student?.name || data?.user?.name || 'Student',
        status: 'success',
        message: 'Attendance verified',
        time: new Date().toLocaleTimeString(),
      };
      setResult(entry);
      setRecentScans((prev) => [entry, ...prev].slice(0, 20));
      showToast(`Attendance recorded for ${entry.name}`, 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Verification failed';
      const entry = {
        token: token.slice(0, 12) + '...',
        name: '—',
        status: 'error',
        message: msg,
        time: new Date().toLocaleTimeString(),
      };
      setResult(entry);
      setRecentScans((prev) => [entry, ...prev].slice(0, 20));
      showToast(msg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verifyToken(manualToken.trim());
    setManualToken('');
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-primary-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <HiQrCode className="text-xl text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">QR Scanner</h1>
              {event && <p className="text-blue-100">{event.title}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Area */}
          <div className="space-y-5">
            {/* QR Scanner */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">Scan QR Code</h2>
              {!scanning ? (
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center mb-4">
                    <HiQrCode className="text-5xl text-surface-400" />
                  </div>
                  <button
                    onClick={startScanner}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-primary-600 hover:from-blue-700 hover:to-primary-700 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <HiQrCode /> Start Scanner
                  </button>
                </div>
              ) : (
                <div id="qr-reader" ref={scannerRef} className="rounded-xl overflow-hidden" />
              )}
            </div>

            {/* Manual Entry */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HiCommandLine className="text-lg text-surface-500" />
                <h3 className="font-semibold text-surface-900 dark:text-white">Manual Token Entry</h3>
              </div>
              <form onSubmit={handleManualSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Enter QR token..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={verifying || !manualToken.trim()}
                  className="px-5 py-2.5 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {verifying ? <LoadingSpinner size="sm" /> : 'Verify'}
                </button>
              </form>
            </div>

            {/* Result */}
            {result && (
              <div className={`rounded-2xl border p-5 animate-slide-up ${
                result.status === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  {result.status === 'success' ? (
                    <HiCheckCircle className="text-3xl text-emerald-500 flex-shrink-0" />
                  ) : (
                    <HiXCircle className="text-3xl text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-semibold ${result.status === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                      {result.message}
                    </p>
                    {result.name !== '—' && (
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-0.5">
                        Student: {result.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Scans */}
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
              Recent Scans
              <span className="ml-2 text-sm font-normal text-surface-400">({recentScans.length})</span>
            </h2>
            {recentScans.length === 0 ? (
              <div className="text-center py-10">
                <HiClock className="text-4xl text-surface-300 dark:text-surface-600 mx-auto mb-2" />
                <p className="text-sm text-surface-500 dark:text-surface-400">No scans yet. Start scanning to see results here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentScans.map((scan, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${
                    scan.status === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-900/10'
                      : 'bg-red-50 dark:bg-red-900/10'
                  }`}>
                    {scan.status === 'success' ? (
                      <HiCheckCircle className="text-lg text-emerald-500 flex-shrink-0" />
                    ) : (
                      <HiXCircle className="text-lg text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{scan.name}</p>
                      <p className="text-xs text-surface-500">{scan.message}</p>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">{scan.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
