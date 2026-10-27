import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { registrationsAPI } from '../api/registrations';
import { EventCard } from '../components/EventCard';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EventCardSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Workshop',
  'Hackathon',
  'Seminar',
  'Cultural',
  'Sports',
  'Networking',
  'Competition',
];

export const EventsCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Filters state initialized from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get('dateFilter') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_asc');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  const [registeringEvent, setRegisteringEvent] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        dateFilter: dateFilter || undefined,
        sort: sortBy,
      };

      const data = await eventsAPI.getEvents(params);
      if (data.success) {
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
        setTotalEvents(data.totalEvents || 0);
      }
    } catch (err) {
      toast({
        title: 'Error loading events',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCategory, dateFilter, sortBy, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (dateFilter) params.set('dateFilter', dateFilter);
    if (sortBy !== 'date_asc') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [search, selectedCategory, dateFilter, sortBy, currentPage, setSearchParams]);

  const handleQuickRegister = (event) => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign In Required',
        message: 'Please sign in or create an account to register for events.',
        type: 'info',
      });
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
          title: 'Ticket Reserved! 🎟️',
          message: `Your registration for ${registeringEvent.title} is confirmed.`,
          type: 'success',
        });
        refreshNotifications();
        // Update local card state
        setEvents((prev) =>
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
        title: 'Registration Failed',
        message: err.message || 'Could not complete registration.',
        type: 'error',
      });
    } finally {
      setRegLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setDateFilter('');
    setSortBy('date_asc');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
          Explore Campus Events
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Browse upcoming hackathons, tech workshops, guest lectures, and cultural gatherings.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        {/* Search bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="events-search-input"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by event title, venue, host club, or tags..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Date filter dropdown */}
            <div className="relative flex-1 sm:w-44">
              <select
                id="date-filter-select"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="past">Past Events</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:w-44">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="date_asc">Date (Soonest)</option>
                <option value="date_desc">Date (Latest)</option>
                <option value="newest">Newly Added</option>
                <option value="capacity_desc">Capacity (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`category-pill-${cat}`}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="font-semibold text-white">{events.length}</span> of{' '}
          <span className="font-semibold text-white">{totalEvents}</span> events
        </span>

        {(search || selectedCategory !== 'All' || dateFilter) && (
          <button
            onClick={resetFilters}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="Try selecting a different category or clearing search terms."
          actionText="Clear Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onQuickRegister={handleQuickRegister}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            id="pagination-prev-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-300 px-4 font-medium">
            Page <span className="text-white font-bold">{currentPage}</span> of{' '}
            <span className="text-white font-bold">{totalPages}</span>
          </span>

          <button
            id="pagination-next-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Registration Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!registeringEvent}
        title="Confirm Event Registration"
        message={`Would you like to register for "${registeringEvent?.title}"? A confirmed entry ticket pass will be added to your student schedule.`}
        confirmText="Confirm Registration"
        onConfirm={confirmRegistration}
        onCancel={() => setRegisteringEvent(null)}
        loading={regLoading}
        variant="primary"
      />
    </div>
  );
};
