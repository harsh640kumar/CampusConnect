import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Compass,
  Calendar,
  Users,
  LayoutDashboard,
  ShieldAlert,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, switchDemoAccount } = useAuth();
  const { unreadCount, isOpen: isNotifOpen, setIsOpen: setIsNotifOpen } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleRoleSwitch = async (role) => {
    setRoleSwitcherOpen(false);
    const res = await switchDemoAccount(role);
    if (res?.success) {
      if (role === 'student') navigate('/dashboard/student');
      else if (role === 'coordinator') navigate('/dashboard/coordinator');
      else if (role === 'admin') navigate('/dashboard/admin');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-glow-primary group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                Campus<span className="gradient-text">Connect</span>
              </span>
              <span className="block text-[10px] text-slate-400 -mt-1 font-medium tracking-wide">
                College Hub & Events
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/events"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/events')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>

            <Link
              to="/clubs"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/clubs')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              Clubs
            </Link>

            {/* Role specific dashboard link */}
            {isAuthenticated && (
              <>
                {user.role === 'student' && (
                  <Link
                    to="/dashboard/student"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/dashboard/student')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Schedule
                  </Link>
                )}

                {user.role === 'coordinator' && (
                  <Link
                    to="/dashboard/coordinator"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/dashboard/coordinator')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Coordinator Studio
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/dashboard/admin"
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/dashboard/admin')
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Admin Console
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Section: Role Switcher, Notification, User / Auth buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                id="demo-switcher-btn"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 transition-all shadow-sm"
                title="Switch demo account instantly"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Roles</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div
                  id="demo-switcher-menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Instant Demo Login
                  </p>
                  <button
                    id="switch-student-btn"
                    onClick={() => handleRoleSwitch('student')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-800/80 transition-colors flex items-center justify-between text-slate-200"
                  >
                    <span>🎓 Student (Emily)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">active</span>
                  </button>
                  <button
                    id="switch-coordinator-btn"
                    onClick={() => handleRoleSwitch('coordinator')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-800/80 transition-colors flex items-center justify-between text-slate-200"
                  >
                    <span>🛠️ Coordinator (Alex)</span>
                    <span className="text-[10px] text-indigo-400 font-mono">acm</span>
                  </button>
                  <button
                    id="switch-admin-btn"
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-800/80 transition-colors flex items-center justify-between text-slate-200"
                  >
                    <span>👑 Admin (Dr. Vance)</span>
                    <span className="text-[10px] text-rose-400 font-mono">dean</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  id="notification-bell-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors relative"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span
                      id="notification-badge"
                      className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-950 animate-pulse"
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown />
              </div>
            )}

            {/* User Profile / Auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all"
                >
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-semibold text-white leading-tight">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <img
                    src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700 bg-slate-800"
                  />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in"
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        My Profile
                      </Link>
                      <button
                        id="logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  id="nav-login-btn"
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  id="nav-register-btn"
                  to="/register"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl p-4 space-y-2">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            Events
          </Link>
          <Link
            to="/clubs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            Clubs
          </Link>

          {isAuthenticated && (
            <>
              {user.role === 'student' && (
                <Link
                  to="/dashboard/student"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  My Schedule
                </Link>
              )}
              {user.role === 'coordinator' && (
                <Link
                  to="/dashboard/coordinator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  Coordinator Studio
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/dashboard/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Admin Console
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          )}

          {/* Mobile demo role buttons */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Role Switch
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRoleSwitch('student');
                }}
                className="py-1.5 px-2 text-center text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500"
              >
                Student
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRoleSwitch('coordinator');
                }}
                className="py-1.5 px-2 text-center text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500"
              >
                Coord
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleRoleSwitch('admin');
                }}
                className="py-1.5 px-2 text-center text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-indigo-500"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
