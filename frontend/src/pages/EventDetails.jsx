import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { registrationsAPI } from '../api/registrations';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Share2,
  Mail,
  QrCode,
  Tag,
} from 'lucide-react';

export const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // 'register' | 'cancel' | null
  const [actionLoading, setActionLoading] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getEventById(id);
      if (data.success) {
        setEvent(data.event);
      }
    } catch (err) {
      toast({
        title: 'Error loading event',
        message: err.message || 'Event not found',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Event Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The event you are looking for may have been removed or rescheduled.
        </p>
        <Link
          to="/events"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Browse All Events
        </Link>
      </div>
    );
  }

  const isRegistered =
    event.userRegistration && event.userRegistration.status === 'registered';

  const eventDate = new Date(event.date);
  const deadline = new Date(event.registrationDeadline);
  const now = new Date();
  const isPastDeadline = now > deadline;
  const isSoldOut = (event.registeredCount || 0) >= event.capacity;
  const spotsLeft = Math.max(0, event.capacity - (event.registeredCount || 0));

  const handleRegisterConfirm = async () => {
    try {
      setActionLoading(true);
      const res = await registrationsAPI.registerForEvent(event._id);
      if (res.success) {
        toast({
          title: 'Ticket Confirmed! 🎟️',
          message: 'Your registration pass is now active.',
          type: 'success',
        });
        refreshNotifications();
        await fetchEvent();
        setActionModal(null);
      }
    } catch (err) {
      toast({
        title: 'Registration Error',
        message: err.message || 'Could not register for this event.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    try {
      setActionLoading(true);
      const res = await registrationsAPI.cancelRegistration(event._id);
      if (res.success) {
        toast({
          title: 'Registration Cancelled',
          message: 'Your seat has been released.',
          type: 'info',
        });
        refreshNotifications();
        await fetchEvent();
        setActionModal(null);
      }
    } catch (err) {
      toast({
        title: 'Cancellation Error',
        message: err.message || 'Could not cancel registration.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      message: 'Event link copied to your clipboard.',
      type: 'info',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Catalog
        </Link>
      </div>

      {/* Main Banner Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800">
        <div className="h-64 sm:h-80 w-full overflow-hidden relative bg-slate-900">
          <img
            src={
              event.bannerImage ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Action tags top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="text-xs px-3 py-1 rounded-full font-semibold border backdrop-blur-md bg-indigo-950/80 text-indigo-300 border-indigo-500/40">
              {event.category}
            </span>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors"
              title="Share event link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Banner bottom info */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 flex items-center gap-2">
              Hosted by{' '}
              <Link
                to={`/clubs/${event.club?.slug || event.club?._id}`}
                className="text-indigo-400 hover:underline font-semibold"
              >
                {event.club?.name}
              </Link>
            </p>
          </div>
        </div>

        {/* Quick event meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-950/60 border-t border-slate-800 text-xs">
          <div className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-slate-400">Date</p>
              <p className="font-semibold text-white">
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-slate-400">Time</p>
              <p className="font-semibold text-white">
                {event.startTime} - {event.endTime}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-slate-400">Venue</p>
              <p className="font-semibold text-white truncate max-w-[150px]">
                {event.venue}
              </p>
            </div>
          </div>

          <div className="p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-slate-400">Capacity</p>
              <p className="font-semibold text-white">
                {event.registeredCount || 0} / {event.capacity} seats
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Description, Host Club info, Tags */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Event */}
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">About this Event</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Related Topics & Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Organizing Club Card */}
          {event.club && (
            <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                <img
                  src={event.club.logo || 'https://api.dicebear.com/7.x/identicon/svg?seed=club'}
                  alt={event.club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white truncate">
                    {event.club.name}
                  </h3>
                  <Link
                    to={`/clubs/${event.club.slug || event.club._id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold shrink-0"
                  >
                    View Club Profile →
                  </Link>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {event.club.description}
                </p>
                {event.club.contactEmail && (
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{event.club.contactEmail}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Registration Box & Digital Pass */}
        <div className="space-y-6">
          {/* Active Digital Pass (if registered) */}
          {isRegistered ? (
            <div
              id="digital-ticket-card"
              className="rounded-3xl glass-card border border-emerald-500/40 p-6 shadow-glow-primary bg-gradient-to-b from-emerald-950/30 to-slate-900/80 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Your Digital Pass
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Confirmed
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Ticket Reference
                  </p>
                  <p
                    id="ticket-number-display"
                    className="font-mono text-base font-bold text-white tracking-wider"
                  >
                    {event.userRegistration.ticketNumber || 'CC-PASS-VALID'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Attendee</p>
                  <p className="text-xs font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-[11px] text-slate-400">{user?.department}</p>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Check-in Attendance
                  </p>
                  <div className="mt-1">
                    {event.userRegistration.attendanceStatus === 'present' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Present
                      </span>
                    ) : event.userRegistration.attendanceStatus === 'absent' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Marked Absent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Awaiting Check-in
                      </span>
                    )}
                  </div>
                </div>

                {/* QR Code representation */}
                <div className="pt-2 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-center">
                    <QrCode className="w-20 h-20 mx-auto text-indigo-300" />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Show at entry desk for scanning
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancel Registration button */}
              <button
                id="cancel-registration-btn"
                onClick={() => setActionModal('cancel')}
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-all text-center"
              >
                Cancel Registration
              </button>
            </div>
          ) : (
            /* Registration Card (Not registered) */
            <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-4">
              <h3 className="font-bold text-base text-white tracking-tight">Event Registration</h3>

              {/* Countdown / Deadline info */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400 block">Registration Deadline</span>
                <span
                  className={`font-semibold block mt-0.5 ${
                    isPastDeadline ? 'text-rose-400' : 'text-amber-400'
                  }`}
                >
                  {deadline.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • 11:59 PM
                </span>
                {isPastDeadline && (
                  <span className="text-[11px] text-rose-400 mt-1 block">
                    Registration deadline has passed.
                  </span>
                )}
              </div>

              {/* Spots availability */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Available Spots</span>
                  <span
                    className={`font-semibold ${
                      spotsLeft === 0
                        ? 'text-rose-400'
                        : spotsLeft < 10
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {spotsLeft === 0 ? 'Sold Out' : `${spotsLeft} seats left`}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isSoldOut ? 'bg-rose-500' : 'bg-indigo-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((event.registeredCount || 0) / event.capacity) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Register CTA Button */}
              {isAuthenticated ? (
                <button
                  id="event-details-register-btn"
                  onClick={() => setActionModal('register')}
                  disabled={isPastDeadline || isSoldOut}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <Ticket className="w-4 h-4" />
                  {isSoldOut
                    ? 'Event at Full Capacity'
                    : isPastDeadline
                    ? 'Registration Closed'
                    : 'Reserve Free Ticket'}
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    Sign In to Register
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 hover:underline">
                      Sign up free
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={actionModal === 'register'}
        title="Confirm Event Registration"
        message={`Are you sure you want to register for "${event.title}"? Your seat will be reserved and a pass generated.`}
        confirmText="Confirm Reservation"
        onConfirm={handleRegisterConfirm}
        onCancel={() => setActionModal(null)}
        loading={actionLoading}
        variant="primary"
      />

      <ConfirmationModal
        isOpen={actionModal === 'cancel'}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your pass for "${event.title}"? This will release your seat to other students.`}
        confirmText="Yes, Cancel Pass"
        onConfirm={handleCancelConfirm}
        onCancel={() => setActionModal(null)}
        loading={actionLoading}
        variant="danger"
      />
    </div>
  );
};
