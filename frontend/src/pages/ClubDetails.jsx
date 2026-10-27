import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubsAPI } from '../api/clubs';
import { registrationsAPI } from '../api/registrations';
import { EventCard } from '../components/EventCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Users,
  Calendar,
  MapPin,
  Mail,
  Globe,
  ExternalLink,
  Share2,
  ArrowLeft,
  UserCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

export const ClubDetails = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null); // 'join' | 'leave'
  const [actionLoading, setActionLoading] = useState(false);
  const [quickRegEvent, setQuickRegEvent] = useState(null);

  const { user, isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchClub = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubsAPI.getClubById(id);
      if (data.success) {
        setClub(data.club);
        setUpcomingEvents(data.upcomingEvents || []);
      }
    } catch (err) {
      toast({
        title: 'Error loading club',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-400">
        <span className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm">Loading club profile...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Club Not Found</h2>
        <Link
          to="/clubs"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Clubs Directory
        </Link>
      </div>
    );
  }

  const isMember =
    user?.joinedClubs?.some(
      (c) => (c._id || c) === club._id || (c._id || c) === club.id
    ) ||
    club.members?.some((m) => (m._id || m) === user?._id);

  const handleMembershipAction = async () => {
    try {
      setActionLoading(true);
      if (actionModal === 'join') {
        const res = await clubsAPI.joinClub(club._id);
        if (res.success) {
          toast({
            title: 'Welcome to the Club! 🎉',
            message: `You are now a member of ${club.name}.`,
            type: 'success',
          });
        }
      } else {
        const res = await clubsAPI.leaveClub(club._id);
        if (res.success) {
          toast({
            title: 'Left Club',
            message: `You have departed ${club.name}.`,
            type: 'info',
          });
        }
      }
      await refreshUser();
      await fetchClub();
      refreshNotifications();
      setActionModal(null);
    } catch (err) {
      toast({
        title: 'Action Error',
        message: err.message || 'Failed to update membership.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmQuickRegister = async () => {
    if (!quickRegEvent) return;
    try {
      const res = await registrationsAPI.registerForEvent(quickRegEvent._id);
      if (res.success) {
        toast({
          title: 'Ticket Reserved! 🎟️',
          message: `You are registered for ${quickRegEvent.title}.`,
          type: 'success',
        });
        refreshNotifications();
        await fetchClub();
        setQuickRegEvent(null);
      }
    } catch (err) {
      toast({
        title: 'Registration Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs Directory
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800">
        <div className="h-56 sm:h-72 w-full overflow-hidden relative bg-slate-900">
          <img
            src={
              club.bannerImage ||
              'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-semibold border backdrop-blur-md bg-indigo-950/80 text-indigo-300 border-indigo-500/40">
            {club.category}
          </span>
        </div>

        {/* Club Details Header Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="-mt-12 sm:-mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-slate-950 border-2 border-indigo-500/50 shadow-2xl overflow-hidden shrink-0">
                <img
                  src={
                    club.logo ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
                      club.name
                    )}`
                  }
                  alt={club.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  {club.name}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-semibold text-indigo-400">
                    <Users className="w-3.5 h-3.5" />
                    {club.members?.length || 1} Registered Members
                  </span>
                </div>
              </div>
            </div>

            {/* Join / Leave button */}
            {isAuthenticated ? (
              isMember ? (
                <button
                  id="club-leave-btn"
                  onClick={() => setActionModal('leave')}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all flex items-center gap-2 group"
                >
                  <UserCheck className="w-4 h-4 group-hover:hidden" />
                  <span className="group-hover:hidden">Active Member</span>
                  <span className="hidden group-hover:inline">Leave Club</span>
                </button>
              ) : (
                <button
                  id="club-join-btn"
                  onClick={() => setActionModal('join')}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Club
                </button>
              )
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30"
              >
                Sign In to Join
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: About & Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              About the Club
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {club.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Regular Meetups</span>
                  <span className="font-semibold text-white">
                    {club.meetingSchedule || 'Weekly sessions'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Campus Venue</span>
                  <span className="font-semibold text-white">
                    {club.location || 'Student Activity Center'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events from this Club */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Upcoming Club Events
              </h2>
              <span className="text-xs text-slate-400">
                {upcomingEvents.length} scheduled
              </span>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-8 rounded-2xl glass-card border border-slate-800 text-center text-slate-400 text-xs">
                No upcoming events currently scheduled for this club. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.map((evt) => (
                  <EventCard
                    key={evt._id}
                    event={{ ...evt, club: { name: club.name, logo: club.logo } }}
                    onQuickRegister={(e) => setQuickRegEvent(e)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Coordinator & Social info */}
        <div className="space-y-6">
          {/* Coordinator Card */}
          {club.coordinator && (
            <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Faculty & Student Leadership
              </span>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={
                    club.coordinator.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${club.coordinator.name}`
                  }
                  alt={club.coordinator.name}
                  className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {club.coordinator.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {club.coordinator.department || 'Lead Coordinator'}
                  </p>
                </div>
              </div>

              {club.contactEmail && (
                <div className="pt-2 text-xs text-slate-300 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <a
                    href={`mailto:${club.contactEmail}`}
                    className="hover:underline text-indigo-300 truncate"
                  >
                    {club.contactEmail}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Community Channels
            </span>
            <div className="space-y-2 pt-1 text-xs">
              {club.socialLinks?.website && (
                <a
                  href={club.socialLinks.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Official Website</span>
                </a>
              )}
              {club.socialLinks?.github && (
                <a
                  href={club.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>GitHub Repository</span>
                </a>
              )}
              {club.socialLinks?.linkedin && (
                <a
                  href={club.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-sky-400" />
                  <span>LinkedIn Network</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!actionModal}
        title={actionModal === 'join' ? `Join ${club.name}?` : `Leave ${club.name}?`}
        message={
          actionModal === 'join'
            ? `Become a member of ${club.name} and get notified about future symposiums and workshops.`
            : `Are you sure you want to withdraw from ${club.name}?`
        }
        confirmText={actionModal === 'join' ? 'Confirm Join' : 'Confirm Departure'}
        onConfirm={handleMembershipAction}
        onCancel={() => setActionModal(null)}
        loading={actionLoading}
        variant={actionModal === 'join' ? 'primary' : 'danger'}
      />

      <ConfirmationModal
        isOpen={!!quickRegEvent}
        title="Confirm Event Registration"
        message={`Register for "${quickRegEvent?.title}"?`}
        confirmText="Register"
        onConfirm={confirmQuickRegister}
        onCancel={() => setQuickRegEvent(null)}
        variant="primary"
      />
    </div>
  );
};
