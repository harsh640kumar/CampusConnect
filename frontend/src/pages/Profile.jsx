import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Building2,
  IdCard,
  Phone,
  FileText,
  Save,
  Users,
  Shield,
  Camera,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/initials/svg?seed=Alex&backgroundColor=4f46e5',
  'https://api.dicebear.com/7.x/initials/svg?seed=Emily&backgroundColor=059669',
  'https://api.dicebear.com/7.x/initials/svg?seed=Sarah&backgroundColor=d97706',
  'https://api.dicebear.com/7.x/initials/svg?seed=Marcus&backgroundColor=dc2626',
  'https://api.dicebear.com/7.x/initials/svg?seed=Jordan&backgroundColor=7c3aed',
];

export const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    studentId: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        department: user.department || '',
        studentId: user.studentId || '',
        phone: user.phone || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarSelect = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        message: 'Name cannot be empty.',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile(formData);
      if (res?.success) {
        await refreshUser();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-400 text-sm">Please sign in to view your profile.</p>
        <Link
          to="/login"
          className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={formData.avatar || user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500/40 bg-slate-800 shadow-xl"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {user.name}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.department || 'Department of Engineering'}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'student' && (
              <Link
                to="/dashboard/student"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                My Schedule
              </Link>
            )}
            {user.role === 'coordinator' && (
              <Link
                to="/dashboard/coordinator"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Coordinator Studio
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                to="/dashboard/admin"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Settings Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Profile Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your student or faculty contact details and bio visible to club coordinators.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAvatarSelect(preset)}
                      className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                        formData.avatar === preset
                          ? 'border-indigo-500 scale-105 ring-2 ring-indigo-500/30'
                          : 'border-slate-700 hover:border-slate-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="preset" className="w-full h-full rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="profile-name-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="profile-department-input"
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Student ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student / Faculty ID
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="profile-studentid-input"
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g. CS-2024-101"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="profile-phone-input"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bio / Interests
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    id="profile-bio-input"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell campus peers about your technical passions, artistic interests, or extracurricular goals..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Info: Joined Clubs & Membership Details */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Joined Clubs
              </h3>
              <span className="text-xs text-slate-400">
                {user.joinedClubs?.length || 0}
              </span>
            </div>

            {(!user.joinedClubs || user.joinedClubs.length === 0) ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <p>You haven't joined any student organizations yet.</p>
                <Link
                  to="/clubs"
                  className="inline-block mt-3 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Explore Clubs Directory →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {user.joinedClubs.map((club) => {
                  const clubName = typeof club === 'object' ? club.name : 'Campus Club';
                  const clubId = typeof club === 'object' ? (club.slug || club._id) : club;
                  const clubCat = typeof club === 'object' ? club.category : 'General';
                  const clubLogo = typeof club === 'object' ? club.logo : null;

                  return (
                    <div
                      key={clubId}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            clubLogo ||
                            `https://api.dicebear.com/7.x/identicon/svg?seed=${clubName}`
                          }
                          alt={clubName}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800"
                        />
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                            {clubName}
                          </p>
                          <span className="text-[10px] text-indigo-400">{clubCat}</span>
                        </div>
                      </div>
                      <Link
                        to={`/clubs/${clubId}`}
                        className="text-[11px] text-slate-400 hover:text-indigo-300 font-medium"
                      >
                        Visit →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Security Card */}
          <div className="rounded-3xl glass-card border border-slate-800 p-6 space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Account Security
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account is secured with JWT cryptographic token authorization. Campus roles are strictly verified on both frontend routing and MongoDB API middleware.
            </p>
            <div className="pt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Session Authenticated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
