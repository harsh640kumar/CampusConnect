import React, { useState, useEffect, useCallback } from 'react';
import { clubsAPI } from '../api/clubs';
import { ClubCard } from '../components/ClubCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { Search, Users, Sparkles, X } from 'lucide-react';

const CLUB_CATEGORIES = [
  'All',
  'Technical',
  'Cultural',
  'Sports',
  'Literary',
  'Social & Outreach',
  'Entrepreneurship',
  'Arts & Media',
];

export const ClubsDirectory = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeAction, setActiveAction] = useState(null); // { type: 'join' | 'leave', clubId, clubName }
  const [actionLoading, setActionLoading] = useState(false);

  const { isAuthenticated, refreshUser } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchClubs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined,
      };
      const data = await clubsAPI.getClubs(params);
      if (data.success) {
        setClubs(data.clubs || []);
      }
    } catch (err) {
      toast({
        title: 'Error loading clubs',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [category, search, toast]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  const handleJoinClick = (clubId) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        message: 'Please sign in to join student clubs.',
        type: 'info',
      });
      return;
    }
    const club = clubs.find((c) => c._id === clubId);
    setActiveAction({ type: 'join', clubId, clubName: club?.name });
  };

  const handleLeaveClick = (clubId) => {
    const club = clubs.find((c) => c._id === clubId);
    setActiveAction({ type: 'leave', clubId, clubName: club?.name });
  };

  const confirmAction = async () => {
    if (!activeAction) return;
    try {
      setActionLoading(true);
      if (activeAction.type === 'join') {
        const res = await clubsAPI.joinClub(activeAction.clubId);
        if (res.success) {
          toast({
            title: 'Welcome to the Club! 🎉',
            message: `You are now a member of ${activeAction.clubName}.`,
            type: 'success',
          });
        }
      } else {
        const res = await clubsAPI.leaveClub(activeAction.clubId);
        if (res.success) {
          toast({
            title: 'Left Club',
            message: `You have left ${activeAction.clubName}.`,
            type: 'info',
          });
        }
      }
      await refreshUser();
      await fetchClubs();
      refreshNotifications();
      setActiveAction(null);
    } catch (err) {
      toast({
        title: 'Action Error',
        message: err.message || 'Could not update club membership.',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          Student Clubs & Societies
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Join vibrant student communities, participate in weekly meetups, and hone your skills.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            id="clubs-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name, mission, or category..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {CLUB_CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`club-category-${cat}`}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-3xl glass-card animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <EmptyState
          title="No clubs match your search"
          description="Try broadening your category filter or clearing the search terms."
          actionText="Show All Clubs"
          onAction={() => {
            setSearch('');
            setCategory('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onJoin={handleJoinClick}
              onLeave={handleLeaveClick}
            />
          ))}
        </div>
      )}

      {/* Membership Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!activeAction}
        title={
          activeAction?.type === 'join'
            ? `Join ${activeAction?.clubName}?`
            : `Leave ${activeAction?.clubName}?`
        }
        message={
          activeAction?.type === 'join'
            ? `Becoming a member gives you access to club announcements, exclusive workshops, and notifications for all hosted events.`
            : `Are you sure you want to withdraw from this club? You will stop receiving member notices.`
        }
        confirmText={activeAction?.type === 'join' ? 'Join Club' : 'Leave Club'}
        onConfirm={confirmAction}
        onCancel={() => setActiveAction(null)}
        loading={actionLoading}
        variant={activeAction?.type === 'join' ? 'primary' : 'danger'}
      />
    </div>
  );
};
