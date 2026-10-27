import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { registrationsAPI } from '../api/registrations';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Compass,
  ArrowRight,
  Shield,
  QrCode,
  Tag,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingEventId, setCancellingEventId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'clubs'

  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await registrationsAPI.getMyRegistrations();
      if (data.success) {
        setRegistrations(data.registrations || []);
      }
    } catch (err) {
      toast({
        title: 'Error loading schedule',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const activeRegistrations = registrations.filter((r) => r.status === 'registered');
  const pastOrCancelled = registrations.filter((r) => r.status === 'cancelled');

  const handleCancelClick = (eventId) => {
    setCancellingEventId(eventId);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancellingEventId) return;
    try {
      setCancelLoading(true);
      const res = await registrationsAPI.cancelRegistration(cancellingEventId);
      if (res.success) {
        toast({
          title: 'Ticket Cancelled',
          message: 'Your registration has been successfully cancelled.',
          type: 'info',
        });
        refreshNotifications();
        await fetchRegistrations();
        setCancelModalOpen(false);
      }
    } catch (err) {
      toast({
        title: 'Cancellation Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Profile Card */}
      <div className="rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Student'}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/40 bg-slate-800 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {user?.name}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Student Member
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {user?.department} • ID:{' '}
                <span className="font-mono text-indigo-300">
                  {user?.studentId || 'CS-2024-101'}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              to="/events"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Discover Events
            </Link>
            <Link
              to="/clubs"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Browse Clubs
            </Link>
          </div>
        </div>

        {/* Quick Stats Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Active Passes</span>
            <span className="text-xl font-bold text-indigo-400 font-display">
              {activeRegistrations.length}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Verified Attended</span>
            <span className="text-xl font-bold text-emerald-400 font-display">
              {
                registrations.filter((r) => r.attendanceStatus === 'present').length
              }
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Joined Clubs</span>
            <span className="text-xl font-bold text-purple-400 font-display">
              {user?.joinedClubs?.length || 0}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Attendance Standing</span>
            <span className="text-xl font-bold text-amber-400 font-display">100%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          My Event Passes ({activeRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'clubs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Joined Clubs ({user?.joinedClubs?.length || 0})
        </button>
      </div>

      {/* Active Tab: Event Passes */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading your event passes...
            </div>
          ) : activeRegistrations.length === 0 ? (
            <EmptyState
              title="You don't have any active event passes"
              description="Explore the campus catalog to register for upcoming hackathons, workshops, and symposiums."
              actionText="Browse Upcoming Events"
              onAction={() => (window.location.href = '/events')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRegistrations.map((reg) => {
                const event = reg.event;
                if (!event) return null;
                const eventDate = new Date(event.date);

                return (
                  <div
                    key={reg._id}
                    id={`student-pass-${reg._id}`}
                    className="rounded-3xl glass-card border border-slate-700/80 p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all shadow-lg"
                  >
                    <div>
                      {/* Top banner tag & Ticket # */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                          {event.category || 'Event'}
                        </span>
                        <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold">
                          {reg.ticketNumber || 'TICKET-ACTIVE'}
                        </span>
                      </div>

                      {/* Title & Host */}
                      <div className="mt-3">
                        <Link to={`/events/${event._id}`}>
                          <h3 className="font-bold text-base text-white hover:text-indigo-300 transition-colors line-clamp-1">
                            {event.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Organized by {event.club?.name || 'Campus Club'}
                        </p>
                      </div>

                      {/* Event Meta */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>{eventDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                      </div>

                      {/* Attendance Status */}
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Entry Verification:</span>
                        {reg.attendanceStatus === 'present' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified Present
                          </span>
                        ) : reg.attendanceStatus === 'absent' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            Marked Absent
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">
                            Awaiting Check-in Desk
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <Link
                        to={`/events/${event._id}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        View Full Event
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() => handleCancelClick(event._id)}
                        className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition-colors font-medium"
                      >
                        Cancel Ticket
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active Tab: Joined Clubs */}
      {activeTab === 'clubs' && (
        <div className="space-y-6">
          {!user?.joinedClubs || user.joinedClubs.length === 0 ? (
            <EmptyState
              title="You haven't joined any clubs yet"
              description="Join technical societies, debate clubs, or art societies to connect with fellow students."
              actionText="Explore Campus Clubs"
              onAction={() => (window.location.href = '/clubs')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.joinedClubs.map((club) => (
                <div
                  key={club._id || club}
                  className="rounded-3xl glass-card border border-slate-800 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                      <img
                        src={
                          club.logo ||
                          `https://api.dicebear.com/7.x/identicon/svg?seed=${club.name || 'C'}`
                        }
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{club.name}</h4>
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        {club.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Member
                    </span>
                    <Link
                      to={`/clubs/${club.slug || club._id || club}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      Visit Club →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Ticket Cancellation */}
      <ConfirmationModal
        isOpen={cancelModalOpen}
        title="Cancel Ticket Reservation"
        message="Are you sure you want to cancel your event registration? Your ticket pass will become void and the seat released."
        confirmText="Confirm Cancellation"
        onConfirm={confirmCancel}
        onCancel={() => setCancelModalOpen(false)}
        loading={cancelLoading}
        variant="danger"
      />
    </div>
  );
};
