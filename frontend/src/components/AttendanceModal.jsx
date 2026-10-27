import React, { useState, useEffect, useCallback } from 'react';
import { registrationsAPI } from '../api/registrations';
import { useToast } from '../context/ToastContext';
import {
  X,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Download,
  Ticket,
} from 'lucide-react';

export const AttendanceModal = ({ isOpen, onClose, event }) => {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, unmarked: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { toast } = useToast();

  const fetchAttendees = useCallback(async () => {
    if (!event?._id) return;
    try {
      setLoading(true);
      const data = await registrationsAPI.getEventRegistrations(event._id);
      if (data.success) {
        setRegistrations(data.registrations || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      toast({
        title: 'Error loading attendees',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [event?._id, toast]);

  useEffect(() => {
    if (isOpen && event?._id) {
      fetchAttendees();
    }
  }, [isOpen, event?._id, fetchAttendees]);

  if (!isOpen || !event) return null;

  const handleUpdateStatus = async (registrationId, status) => {
    try {
      setUpdatingId(registrationId);
      const data = await registrationsAPI.updateAttendanceStatus(
        registrationId,
        status
      );
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === registrationId ? { ...r, attendanceStatus: status } : r
          )
        );
        // Refresh counts
        fetchAttendees();
        toast({
          title: 'Attendance Updated',
          message: `Student marked as ${status}.`,
          type: 'success',
        });
      }
    } catch (err) {
      toast({
        title: 'Update Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const nameMatch = r.student?.name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = r.student?.email?.toLowerCase().includes(search.toLowerCase());
    const ticketMatch = r.ticketNumber?.toLowerCase().includes(search.toLowerCase());
    const idMatch = r.student?.studentId?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch || ticketMatch || idMatch;
  });

  return (
    <div
      id="attendance-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-4xl rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Attendance & Check-in Desk
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Event: <span className="text-slate-200 font-semibold">{event.title}</span> •{' '}
              {new Date(event.date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total Registered</p>
              <p className="text-base font-bold text-white">{stats.total || registrations.length}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Present (Checked-in)</p>
              <p className="text-base font-bold text-emerald-400">{stats.present}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Marked Absent</p>
              <p className="text-base font-bold text-rose-400">{stats.absent}</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Unmarked</p>
              <p className="text-base font-bold text-amber-400">{stats.unmarked}</p>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            id="attendee-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, department, or ticket number..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Attendee Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department & ID</th>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading attendee records...
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No matching registrations found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr
                    key={reg._id}
                    id={`attendee-row-${reg._id}`}
                    className="hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            reg.student?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${reg.student?.name || 'S'}`
                          }
                          alt={reg.student?.name}
                          className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {reg.student?.name || 'Student'}
                          </p>
                          <p className="text-[11px] text-slate-400">{reg.student?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="text-slate-200">
                        {reg.student?.department || 'General'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {reg.student?.studentId || 'N/A'}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {reg.ticketNumber || 'N/A'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {reg.status === 'cancelled' ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          Cancelled
                        </span>
                      ) : reg.attendanceStatus === 'present' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Present
                        </span>
                      ) : reg.attendanceStatus === 'absent' ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Absent
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                          Unmarked
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {reg.status !== 'cancelled' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`mark-present-${reg._id}`}
                            onClick={() => handleUpdateStatus(reg._id, 'present')}
                            disabled={updatingId === reg._id}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              reg.attendanceStatus === 'present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title="Mark student present"
                          >
                            Present
                          </button>
                          <button
                            id={`mark-absent-${reg._id}`}
                            onClick={() => handleUpdateStatus(reg._id, 'absent')}
                            disabled={updatingId === reg._id}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              reg.attendanceStatus === 'absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title="Mark student absent"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(reg._id, 'unmarked')}
                            disabled={updatingId === reg._id}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            title="Reset to unmarked"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Showing {filteredRegistrations.length} of {registrations.length} registrations
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
