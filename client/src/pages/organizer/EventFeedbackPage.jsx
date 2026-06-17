import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiStar,
  HiChatBubbleBottomCenterText,
  HiArrowLeft,
  HiChartBar,
  HiUserCircle,
} from 'react-icons/hi2';
import * as feedbackService from '../../services/feedbackService';
import * as eventService from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function EventFeedbackPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, fbRes, statsRes] = await Promise.allSettled([
        eventService.getEvent(eventId),
        feedbackService.getEventFeedback(eventId),
        feedbackService.getEventFeedbackStats(eventId),
      ]);
      if (eventRes.status === 'fulfilled') setEvent(eventRes.value.data?.data);
      if (fbRes.status === 'fulfilled') setFeedbacks(Array.isArray(fbRes.value.data?.data) ? fbRes.value.data.data : []);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data);
    } catch {
      showToast('Failed to load feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = stats?.averageRating || (feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1) : 0);
  const totalReviews = stats?.totalReviews || feedbacks.length;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = stats?.distribution?.[star] || feedbacks.filter((f) => f.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, pct };
  });

  const starColors = ['', 'text-red-400', 'text-orange-400', 'text-amber-400', 'text-lime-500', 'text-emerald-500'];

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      <div className="bg-gradient-to-r from-amber-500 to-primary-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-1">Event Feedback</h1>
          {event && <p className="text-amber-100 text-lg">{event.title}</p>}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12">
        {/* Stats Card */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">Average Rating</p>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-6xl font-bold text-surface-900 dark:text-white">{Number(avgRating).toFixed(1)}</span>
                <span className="text-2xl text-surface-400">/5</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <HiStar key={s} className={`text-xl ${s <= Math.round(avgRating) ? 'text-amber-400' : 'text-surface-200 dark:text-surface-700'}`} />
                ))}
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
            </div>

            {/* Distribution */}
            <div className="space-y-2.5">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-400 w-8 text-right">{d.star}★</span>
                  <div className="flex-1 h-3 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-surface-500 w-10 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-4">
          All Reviews
          <span className="ml-2 text-sm font-normal text-surface-400">({feedbacks.length})</span>
        </h2>
        {feedbacks.length === 0 ? (
          <EmptyState icon={HiChatBubbleBottomCenterText} title="No feedback yet" description="No reviews have been submitted for this event." />
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb, i) => (
              <div
                key={fb._id || i}
                className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5 hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {(fb.user?.name || fb.student?.name || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-surface-900 dark:text-white text-sm">
                        {fb.user?.name || fb.student?.name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-surface-400">
                        {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <HiStar key={s} className={`text-sm ${s <= (fb.rating || 0) ? 'text-amber-400' : 'text-surface-200 dark:text-surface-700'}`} />
                      ))}
                    </div>
                    {fb.comment && (
                      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{fb.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
