import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ClubCard = ({ club, onJoin, onLeave }) => {
  const { user } = useAuth();
  const isMember =
    user?.joinedClubs?.some(
      (c) => (c._id || c) === club._id || (c._id || c) === club.id
    ) ||
    club.members?.some((m) => (m._id || m) === user?._id);

  return (
    <div
      id={`club-card-${club._id}`}
      className="group rounded-3xl glass-card overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300"
    >
      <div>
        {/* Banner with logo inset */}
        <div className="relative h-32 w-full overflow-hidden bg-slate-900">
          <img
            src={
              club.bannerImage ||
              'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'
            }
            alt={club.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <span className="absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-semibold border backdrop-blur-md bg-indigo-950/80 text-indigo-300 border-indigo-500/30">
            {club.category}
          </span>
        </div>

        {/* Club Logo & Header */}
        <div className="px-5 pt-0 relative pb-3">
          <div className="-mt-10 mb-3 flex items-end justify-between">
            <div className="w-16 h-16 rounded-2xl p-1 bg-slate-950 border-2 border-indigo-500/40 shadow-xl overflow-hidden shrink-0">
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
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>{club.memberCount || club.members?.length || 1} members</span>
            </div>
          </div>

          <Link to={`/clubs/${club.slug || club._id}`}>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {club.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {club.description}
          </p>

          <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-3">
            {club.meetingSchedule && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{club.meetingSchedule}</span>
              </div>
            )}
            {club.location && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{club.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Join CTA */}
      <div className="p-5 pt-0 flex items-center justify-between gap-2">
        <Link
          to={`/clubs/${club.slug || club._id}`}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors px-3 py-2 rounded-xl hover:bg-slate-800/50"
        >
          View Club
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {user ? (
          isMember ? (
            <button
              onClick={() => onLeave && onLeave(club._id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all group/btn"
              title="Click to leave club"
            >
              <UserCheck className="w-3.5 h-3.5 group-hover/btn:hidden" />
              <span className="group-hover/btn:hidden">Joined</span>
              <span className="hidden group-hover/btn:inline">Leave</span>
            </button>
          ) : (
            <button
              onClick={() => onJoin && onJoin(club._id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Join Club
            </button>
          )
        ) : (
          <Link
            to="/login"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-3 py-1.5"
          >
            Sign in to join
          </Link>
        )}
      </div>
    </div>
  );
};
