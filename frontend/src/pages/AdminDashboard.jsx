import React, { useState, useEffect, useCallback } from 'react';
import { statsAPI, usersAPI } from '../api/stats';
import { useToast } from '../context/ToastContext';
import {
  Users,
  Calendar,
  Building2,
  Ticket,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Shield,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const CATEGORY_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await statsAPI.getAdminStats();
      if (res.success) {
        setStatsData(res);
      }
    } catch (err) {
      toast({
        title: 'Error loading admin analytics',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await usersAPI.getUsers({ search: userSearch.trim() || undefined });
      if (res.success) {
        setUsersList(res.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoadingId(userId);
      const res = await usersAPI.updateUserRole(userId, newRole);
      if (res.success) {
        toast({
          title: 'Role Updated',
          message: `User role modified to ${newRole}.`,
          type: 'success',
        });
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        fetchStats();
      }
    } catch (err) {
      toast({
        title: 'Role Update Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoadingId(userId);
      const res = await usersAPI.toggleUserStatus(userId);
      if (res.success) {
        toast({
          title: 'Status Updated',
          message: res.message || 'User status toggled.',
          type: 'info',
        });
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      toast({
        title: 'Status Toggle Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const metrics = statsData?.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Administrative Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-2">
              University Platform Analytics
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Cross-campus overview of student engagement, club governance, and event capacity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live DB Synced
            </span>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Total Accounts</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold text-white font-display">
              {metrics?.totalUsers ?? '...'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics?.studentsCount ?? 0} Students • {metrics?.coordinatorsCount ?? 0} Coords
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Active Clubs</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-purple-400 font-display">
              {metrics?.totalClubs ?? '...'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              100% Verified Societies
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Total Events</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-amber-400 font-display">
              {metrics?.totalEvents ?? '...'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics?.upcomingEvents ?? 0} upcoming sessions
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px]">Passes & Attendance</span>
              <Ticket className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-emerald-400 font-display">
              {metrics?.totalRegistrations ?? '...'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {metrics?.attendanceRate ?? 85}% attendance verify rate
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends Chart */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm text-white">Monthly Registration Trajectory</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData?.monthlyTrend || []}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#regGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Category Distribution Chart */}
        <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h2 className="font-bold text-sm text-white">Event Category Breakdown</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Distribution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData?.categoryStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {(statsData?.categoryStats || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Governance & Role Management Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              User Governance & Access Control
            </h2>
            <p className="text-xs text-slate-400">
              Assign coordinator rights, verify academic roles, and maintain platform security.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="rounded-3xl glass-card border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Department & Student ID</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {usersLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No matching user records.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr
                      key={u._id}
                      id={`admin-user-row-${u._id}`}
                      className="hover:bg-slate-900/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                          />
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="text-slate-200">{u.department || 'N/A'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {u.studentId || 'No ID'}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={actionLoadingId === u._id}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="student">🎓 Student</option>
                          <option value="coordinator">🛠️ Coordinator</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          disabled={actionLoadingId === u._id}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                            u.isActive
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
