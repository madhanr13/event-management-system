import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiCalendarDays,
  HiClock,
  HiMapPin,
  HiUserGroup,
  HiTag,
  HiUser,
  HiArrowLeft,
  HiTicket,
  HiXMark,
  HiQrCode,
  HiCheckBadge,
  HiAcademicCap,
  HiArrowDownTray,
} from 'react-icons/hi2';
import * as eventService from '../../services/eventService';
import * as registrationService from '../../services/registrationService';
import * as certificateService from '../../services/certificateService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getEvent(id);
      setEvent(res.data?.data);
      // Check if user is registered
      try {
        const regsRes = await registrationService.getMyRegistrations();
        const regs = Array.isArray(regsRes.data?.data) ? regsRes.data.data : [];
        const found = regs.find((r) => (r.event?._id || r.event) === id && r.status !== 'cancelled');
        setRegistration(found || null);
      } catch {
        /* not registered */
      }
    } catch {
      showToast('Failed to load event', 'error');
      navigate('/student/events');
    } finally {
      setLoading(false);
    }
  };

  const countdown = useMemo(() => {
    if (!event?.registrationDeadline) return null;
    const deadline = new Date(event.registrationDeadline);
    const now = new Date();
    const diff = deadline - now;
    if (diff <= 0) return { expired: true };
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return { days, hours, mins, expired: false };
  }, [event]);

  const capacityPercent = event ? Math.min(100, Math.round(((event.currentParticipants || 0) / (event.maxParticipants || 1)) * 100)) : 0;
  const isFull = event && event.currentParticipants >= event.maxParticipants;
  const deadlinePassed = countdown?.expired;
  const canRegister = !registration && !isFull && !deadlinePassed;
  const isAttended = registration?.status === 'attended';
  const isCompleted = event?.status === 'completed';

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await registrationService.registerForEvent(id);
      setRegistration(res.data?.data);
      showToast('Successfully registered for the event!', 'success');
      fetchEvent();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    setCancelling(true);
    try {
      await registrationService.cancelRegistration(registration._id);
      setRegistration(null);
      showToast('Registration cancelled', 'info');
      setShowCancel(false);
      fetchEvent();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Cancel failed', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const res = await certificateService.generateCertificate(id);
      const certData = res.data?.data;
      const certUrl = certData?.certificateUrl;

      if (certUrl) {
        const link = document.createElement('a');
        link.href = certUrl;
        link.download = `certificate_${id}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Certificate downloaded!', 'success');
      } else {
        showToast('Certificate generated!', 'success');
      }
    } catch (err) {
      showToast(err?.response?.data?.message || 'Certificate download failed', 'error');
    } finally {
      setDownloadingCert(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!event) return null;

  const eventDate = new Date(event.date);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {event.poster ? (
          <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 via-primary-700 to-accent-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
            <HiArrowLeft /> Back
          </button>
        </div>
        <div className="absolute bottom-6 left-4 sm:left-6 right-4 sm:right-6">
          <span className="inline-block bg-accent-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {event.category || 'Event'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">{event.title}</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: HiCalendarDays, label: 'Date', value: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-primary-500' },
                { icon: HiClock, label: 'Time', value: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), color: 'text-accent-500' },
                { icon: HiMapPin, label: 'Venue', value: event.venue || 'TBA', color: 'text-emerald-500' },
                { icon: HiUser, label: 'Organizer', value: event.organizer?.name || 'Unknown', color: 'text-amber-500' },
              ].map((info) => (
                <div key={info.label} className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                  <info.icon className={`text-xl ${info.color} mb-2`} />
                  <p className="text-xs text-surface-500 dark:text-surface-400">{info.label}</p>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-3">About This Event</h2>
              <p className="text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description available for this event.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Registration Card */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 border border-surface-200 dark:border-surface-700 shadow-lg">
              {/* Capacity */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-400">Capacity</span>
                  <span className="text-sm font-bold text-surface-900 dark:text-white">
                    {event.currentParticipants || 0} / {event.maxParticipants || '∞'}
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityPercent >= 90 ? 'bg-red-500' : capacityPercent >= 70 ? 'bg-amber-500' : 'bg-primary-500'
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                {isFull && <p className="mt-2 text-xs text-red-500 font-medium">⚠ Event is full</p>}
              </div>

              {/* Countdown */}
              {countdown && (
                <div className="mb-5 p-3 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                  {countdown.expired ? (
                    <p className="text-sm text-red-500 font-medium text-center">Registration deadline has passed</p>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">Registration closes in</p>
                      <div className="flex justify-center gap-3">
                        {[
                          { val: countdown.days, lbl: 'Days' },
                          { val: countdown.hours, lbl: 'Hrs' },
                          { val: countdown.mins, lbl: 'Min' },
                        ].map((t) => (
                          <div key={t.lbl} className="bg-white dark:bg-surface-800 rounded-lg px-3 py-1.5 border border-surface-200 dark:border-surface-700">
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{t.val}</span>
                            <p className="text-[10px] text-surface-400">{t.lbl}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {registration ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <HiCheckBadge className="text-lg text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      {isAttended ? 'Attendance Confirmed!' : 'You are registered!'}
                    </span>
                  </div>

                  {/* QR Code — only show for registered (not attended) */}
                  {registration.status === 'registered' && (
                    <button
                      onClick={() => setShowQR(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                    >
                      <HiQrCode className="text-lg" /> View QR Code
                    </button>
                  )}

                  {/* Certificate download — for attended events */}
                  {isAttended && (
                    <button
                      onClick={handleDownloadCertificate}
                      disabled={downloadingCert}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-60"
                    >
                      {downloadingCert ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <HiArrowDownTray className="text-lg" /> Download Certificate
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel — only for registered (not attended) */}
                  {registration.status === 'registered' && (
                    <button
                      onClick={() => setShowCancel(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <HiXMark /> Cancel Registration
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={!canRegister || registering}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 shadow-lg shadow-primary-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering ? <LoadingSpinner size="sm" /> : <><HiTicket className="text-lg" /> Register Now</>}
                </button>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-700">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <HiTag className="text-primary-500" />
                  <span>{event.category || 'General'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <HiUserGroup className="text-accent-500" />
                  <span>{event.currentParticipants || 0} participants</span>
                </div>
                {event.status && (
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <HiCheckBadge className="text-emerald-500" />
                    <span className="capitalize">{event.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && registration && (
        <Modal onClose={() => setShowQR(false)} title="Your QR Code">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-2xl border-2 border-dashed border-surface-300 mb-4">
              {registration.qrCode ? (
                <img src={registration.qrCode} alt="QR Code" className="w-40 h-40 object-contain" />
              ) : (
                <div className="text-center">
                  <HiQrCode className="text-6xl text-surface-400 mx-auto mb-2" />
                  <p className="text-xs text-surface-500 break-all px-2">{registration.qrToken || registration._id}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-surface-500 dark:text-surface-400">Show this QR code at the event for attendance verification.</p>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation — using isOpen + onClose (not onCancel) */}
      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancelRegistration}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration? This action cannot be undone."
        confirmText="Cancel Registration"
        variant="danger"
      />
    </div>
  );
}
