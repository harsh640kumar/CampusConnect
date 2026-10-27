import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Ticket, ArrowRight, CheckCircle2 } from 'lucide-react';

export const EventCard = ({ event, onQuickRegister }) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const formattedDay = eventDate.toLocaleDateString('en-US', { weekday: 'short' });

  const capacity = event.capacity || 100;
  const registered = event.registeredCount || 0;
  const percentage = Math.min(100, Math.round((registered / capacity) * 100));
  const spotsLeft = Math.max(0, capacity - registered);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Hackathon':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Workshop':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'Seminar':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Cultural':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Sports':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div
      id={`event-card-${event._id}`}
      className="group rounded-3xl glass-card overflow-hidden border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300"
    >
      <div>
        {/* Banner image with date badge */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border backdrop-blur-md shadow-sm ${getCategoryColor(
                event.category
              )}`}
            >
              {event.category}
            </span>

            {/* Date Tag */}
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-2.5 py-1 text-center shadow-lg">
              <span className="block text-[10px] uppercase font-bold text-indigo-400">
                {formattedDay}
              </span>
              <span className="block text-xs font-extrabold text-white">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Host Club Info */}
          {event.club && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-slate-600 shrink-0">
                <img
                  src={event.club.logo || 'https://api.dicebear.com/7.x/identicon/svg?seed=club'}
                  alt={event.club.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-slate-200 drop-shadow-sm truncate max-w-[200px]">
                {event.club.name}
              </span>
            </div>
          )}
        </div>

        {/* Content body */}
        <div className="p-5">
          <Link to={`/events/${event._id}`}>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {registered} / {capacity} seats
              </span>
              <span
                className={`font-semibold text-[11px] ${
                  spotsLeft === 0
                    ? 'text-rose-400'
                    : spotsLeft < 15
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {spotsLeft === 0 ? 'Sold Out' : `${spotsLeft} spots left`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 100
                    ? 'bg-rose-500'
                    : percentage > 75
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-2">
        <Link
          to={`/events/${event._id}`}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition-colors px-3 py-2 rounded-xl hover:bg-slate-800/50"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {event.isUserRegistered ? (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Registered
          </span>
        ) : spotsLeft === 0 ? (
          <span className="text-xs text-rose-400 font-medium px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            Full
          </span>
        ) : (
          <button
            id={`quick-register-${event._id}`}
            onClick={() => onQuickRegister && onQuickRegister(event)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 hover:scale-102 active:scale-98"
          >
            <Ticket className="w-3.5 h-3.5" />
            Register
          </button>
        )}
      </div>
    </div>
  );
};
