import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res?.success) {
        const role = res.user?.role;
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from);
        } else if (role === 'coordinator') {
          navigate('/dashboard/coordinator');
        } else if (role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/student');
        }
      } else {
        setError(res?.error || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    try {
      setLoading(true);
      setError('');
      const res = await login(demoEmail, 'Password@123');
      if (res?.success) {
        const role = res.user?.role;
        if (role === 'coordinator') navigate('/dashboard/coordinator');
        else if (role === 'admin') navigate('/dashboard/admin');
        else navigate('/dashboard/student');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl glass-panel border border-slate-700/80 p-8 shadow-2xl relative overflow-hidden">
        {/* Glow corner accent */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Welcome to CampusConnect
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to manage your campus registrations and clubs.
          </p>
        </div>

        {/* 1-Click Demo Logins Picker */}
        <div className="mb-6 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Accounts (Click to Sign In)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id="demo-login-student"
              type="button"
              onClick={() => handleQuickDemo('student@campusconnect.edu')}
              disabled={loading}
              className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/30 transition-colors text-center"
            >
              🎓 Student
            </button>
            <button
              id="demo-login-coordinator"
              type="button"
              onClick={() => handleQuickDemo('alex.chen@campusconnect.edu')}
              disabled={loading}
              className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-colors text-center"
            >
              🛠️ Coordinator
            </button>
            <button
              id="demo-login-admin"
              type="button"
              onClick={() => handleQuickDemo('admin@campusconnect.edu')}
              disabled={loading}
              className="py-1.5 px-2 rounded-xl text-[11px] font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition-colors text-center"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Campus Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusconnect.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          New to CampusConnect?{' '}
          <Link
            id="login-to-register-link"
            to="/register"
            className="text-indigo-400 hover:underline font-semibold"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
