import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../api/events';
import { clubsAPI } from '../api/clubs';
import { statsAPI } from '../api/stats';
import { CreateEventModal } from '../components/CreateEventModal';
import { AttendanceModal } from '../components/AttendanceModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Calendar,
  Users,
  CheckCircle2,
  Plus,
  Edit,
  Trash2,
  MapPin,
  ClipboardCheck,
  Search,
  Sparkles,
  Award,
} from 'lucide-react';

export const CoordinatorDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { toast } = useToast();

  const loadCoordinatorData = useCallback(async () => {
    try {
      setLoading(true);
      const [eventsRes, clubsRes, statsRes] = await Promise.all([
        eventsAPI.getMyCoordinatedEvents(),
        clubsAPI.getMyCoordinatedClubs(),
        statsAPI.getCoordinatorStats(),
      ]);

      if (eventsRes.success) setEvents(eventsRes.events || []);
      if (clubsRes.success) setClubs(clubsRes.clubs || []);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      toast({
        title: 'Error loading coordinator studio',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCoordinatorData();
  }, [loadCoordinatorData]);

  const handleCreateOrUpdateEvent = async (eventData) => {
    try {
      setModalLoading(true);
      if (editingEvent) {
        const res = await eventsAPI.updateEvent(editingEvent._id, eventData);
        if (res.success) {
          toast({
            title: 'Event Updated',
            message: 'Your event modifications have been saved.',
            type: 'success',
          });
        }
      } else {
        const res = await eventsAPI.createEvent(eventData);
        if (res.success) {
          toast({
            title: 'Event Published! 🚀',
            message: 'Campus community notified about your new event.',
            type: 'success',
          });
        }
      }
      setCreateModalOpen(false);
      setEditingEvent(null);
      await loadCoordinatorData();
    } catch (err) {
      toast({
        title: 'Save Failed',
        message: err.message || 'Could not save event.',
        type: 'error',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    try {
      setModalLoading(true);
      const res = await eventsAPI.deleteEvent(deletingEvent._id);
      if (res.success) {
        toast({
          title: 'Event Deleted',
          message: 'The event and attendees have been removed.',
          type: 'info',
        });
        setDeletingEvent(null);
        await loadCoordinatorData();
      }
    } catch (err) {
      toast({
        title: 'Delete Failed',
        message: err.message || 'Could not delete event.',
        type: 'error',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Club Coordinator Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Coordinating:{' '}
              <span className="font-semibold text-white">
                {clubs.map((c) => c.name).join(', ') || 'Assigned Student Clubs'}
              </span>
            </p>
          </div>

          <button
            id="create-event-top-btn"
            onClick={() => {
              setEditingEvent(null);
              setCreateModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Publish New Event
          </button>
        </div>

        {/* Studio KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Managed Events</span>
            <span className="text-xl font-bold text-white font-display">
              {stats?.totalEvents ?? events.length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Registered</span>
            <span className="text-xl font-bold text-indigo-400 font-display">
              {stats?.totalRegistrations ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Check-ins Verified</span>
            <span className="text-xl font-bold text-emerald-400 font-display">
              {stats?.presentCount ?? 0}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Attendance Rate</span>
            <span className="text-xl font-bold text-amber-400 font-display">
              {stats?.attendanceRate ?? 85}%
            </span>
          </div>
        </div>
      </div>

      {/* Events Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Organized Campus Events
            </h2>
            <p className="text-xs text-slate-400">
              Manage live attendee capacity, mark check-ins, and edit event schedules.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter events..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table of Events */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading managed events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events organized yet"
            description="Create your first hackathon, seminar, or workshop for your student club."
            actionText="Create an Event Now"
            onAction={() => {
              setEditingEvent(null);
              setCreateModalOpen(true);
            }}
          />
        ) : (
          <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Event Details</th>
                    <th className="py-3.5 px-4">Schedule & Venue</th>
                    <th className="py-3.5 px-4">Capacity & Registrations</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredEvents.map((evt) => {
                    const eventDate = new Date(evt.date);
                    const capacity = evt.capacity || 100;
                    const registered = evt.registeredCount || 0;
                    const percentage = Math.min(100, Math.round((registered / capacity) * 100));

                    return (
                      <tr
                        key={evt._id}
                        id={`coord-event-row-${evt._id}`}
                        className="hover:bg-slate-900/60 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                              <img
                                src={
                                  evt.bannerImage ||
                                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80'
                                }
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white line-clamp-1">{evt.title}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-medium">
                                {evt.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-200">
                              {eventDate.toLocaleDateString()} • {evt.startTime}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                              {evt.venue}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-300 font-semibold">
                                {registered} / {capacity}
                              </span>
                              <span className="text-indigo-400 font-mono">{percentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
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
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              evt.status === 'upcoming'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : evt.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {evt.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Attendance Desk Button */}
                            <button
                              id={`attendance-desk-btn-${evt._id}`}
                              onClick={() => setAttendanceEvent(evt)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1"
                              title="Open Attendance & Check-in Desk"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>Attendance Desk</span>
                            </button>

                            {/* Edit button */}
                            <button
                              id={`edit-event-btn-${evt._id}`}
                              onClick={() => {
                                setEditingEvent(evt);
                                setCreateModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit Event Details"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              id={`delete-event-btn-${evt._id}`}
                              onClick={() => setDeletingEvent(evt)}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              title="Cancel / Delete Event"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleCreateOrUpdateEvent}
        clubs={clubs}
        initialData={editingEvent}
        loading={modalLoading}
      />

      {/* Attendance Check-in Modal */}
      <AttendanceModal
        isOpen={!!attendanceEvent}
        onClose={() => {
          setAttendanceEvent(null);
          loadCoordinatorData();
        }}
        event={attendanceEvent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingEvent}
        title="Delete Campus Event"
        message={`Are you sure you want to delete "${deletingEvent?.title}"? All existing attendee registrations will be cancelled and notified.`}
        confirmText="Confirm Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEvent(null)}
        loading={modalLoading}
        variant="danger"
      />
    </div>
  );
};
