import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiStar,
  HiPaperAirplane,
  HiArrowLeft,
  HiCalendarDays,
  HiMapPin,
  HiChatBubbleBottomCenterText,
} from 'react-icons/hi2';
import * as eventService from '../../services/eventService';
import * as feedbackService from '../../services/feedbackService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function FeedbackPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({ event: eventId, rating, comment });
      showToast('Feedback submitted successfully!', 'success');
      setSubmitted(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 animate-fade-in">
      <div className="bg-gradient-to-r from-accent-600 to-primary-700 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
            <HiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Share Your Feedback</h1>
          <p className="text-white/80">Help us improve future events with your review</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Info */}
        {event && (
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-5 mb-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{event.title}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-surface-500 dark:text-surface-400">
              {event.date && (
                <span className="flex items-center gap-1">
                  <HiCalendarDays className="text-primary-500" />
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
        )}

        {/* Feedback Form */}
        {submitted ? (
          <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-10 text-center animate-slide-up">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiChatBubbleBottomCenterText className="text-3xl text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">Thank You!</h2>
            <p className="text-surface-500 dark:text-surface-400">Your feedback has been submitted successfully. Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 sm:p-8 space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                How would you rate this event?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="group focus:outline-none transition-transform hover:scale-110"
                  >
                    <HiStar
                      className={`text-4xl transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-amber-400'
                          : 'text-surface-200 dark:text-surface-700'
                      }`}
                    />
                  </button>
                ))}
                {(hoveredRating || rating) > 0 && (
                  <span className="ml-3 text-sm font-medium text-surface-600 dark:text-surface-400">
                    {ratingLabels[hoveredRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Your Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                placeholder="Share your experience, suggestions, or what you enjoyed most..."
                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-accent-600 to-primary-600 hover:from-accent-700 hover:to-primary-700 shadow-lg shadow-accent-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <><HiPaperAirplane /> Submit Feedback</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
