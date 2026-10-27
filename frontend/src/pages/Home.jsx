import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { clubsAPI } from '../api/clubs';
import { registrationsAPI } from '../api/registrations';
import { EventCard } from '../components/EventCard';
import { ClubCard } from '../components/ClubCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Sparkles,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  Search,
} from 'lucide-react';

export const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [eventsRes, clubsRes] = await Promise.all([
          eventsAPI.getFeaturedEvents(),
          clubsAPI.getClubs({ limit: 4 }),
        ]);

        if (eventsRes.success) setFeaturedEvents(eventsRes.events || []);
        if (clubsRes.success) setClubs(clubsRes.clubs?.slice(0, 3) || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const handleQuickRegister = (event) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to register for events.',
        type: 'info',
      });
      navigate('/login');
      return;
    }
    setRegisteringEvent(event);
  };

  const confirmRegistration = async () => {
    if (!registeringEvent) return;
    try {
      setRegLoading(true);
      const res = await registrationsAPI.registerForEvent(registeringEvent._id);
      if (res.success) {
        toast({
          title: 'Registered Successfully! 🎟️',
          message: `Your ticket for ${registeringEvent.title} is confirmed.`,
          type: 'success',
        });
        refreshNotifications();
        // Update local state
        setFeaturedEvents((prev) =>
          prev.map((e) =>
            e._id === registeringEvent._id
              ? {
                  ...e,
                  isUserRegistered: true,
                  registeredCount: (e.registeredCount || 0) + 1,
                }
              : e
          )
        );
        setRegisteringEvent(null);
      }
    } catch (err) {
      toast({
        title: 'Registration Error',
        message: err.message || 'Could not complete registration.',
        type: 'error',
      });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glowing backdrop aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>The University Experience, Unified</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Discover Campus Events.{' '}
          <span className="gradient-text">Lead Student Clubs.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From 36-hour national hackathons and robotics symposiums to cultural galleries and debate
          tournaments—experience college life to the fullest.
        </p>

        {/* Hero Search Box */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-8 max-w-2xl mx-auto p-2 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-2 px-3 w-full">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              id="hero-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, workshops, guest lectures, clubs..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-2"
            />
          </div>
          <button
            id="hero-search-btn"
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 shrink-0 flex items-center justify-center gap-2"
          >
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Key Metrics Strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl glass-card text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-white font-display">
              50+
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Active Student Clubs</span>
          </div>
          <div className="p-4 rounded-2xl glass-card text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-400 font-display">
              1,200+
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Annual Registrations</span>
          </div>
          <div className="p-4 rounded-2xl glass-card text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
              100%
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Digital Ticket Passes</span>
          </div>
          <div className="p-4 rounded-2xl glass-card text-center">
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
              95%
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Verified Attendance</span>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" />
              <span>Happening Soon</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Campus Highlights
            </h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors group"
          >
            <span>View all campus events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onQuickRegister={handleQuickRegister}
            />
          ))}
        </div>
      </section>

      {/* Featured Clubs Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Student Organizations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Spotlight Student Clubs & Societies
            </h2>
          </div>
          <Link
            to="/clubs"
            className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors group"
          >
            <span>Explore all clubs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard key={club._id} club={club} />
          ))}
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-slate-700/60 relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Built for Collegiate Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mt-2">
              Everything Your Campus Community Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Event Discovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by technical, cultural, sports, and entrepreneurship categories with
                real-time seat capacity counters.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Capacity & Duplicate Guards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atomic reservation locking prevents overbooking and eliminates duplicate passes
                automatically.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Live Attendance Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Club coordinators mark attendee check-ins in real time with instant student
                in-app notification confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!registeringEvent}
        title="Confirm Event Registration"
        message={`Would you like to reserve a ticket for "${registeringEvent?.title}" organized by ${registeringEvent?.club?.name}?`}
        confirmText="Confirm Ticket"
        onConfirm={confirmRegistration}
        onCancel={() => setRegisteringEvent(null)}
        loading={regLoading}
        variant="primary"
      />
    </div>
  );
};
