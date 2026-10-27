import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, Shield, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-extrabold text-base text-white">
                Campus<span className="gradient-text">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The unified digital platform for collegiate activities, technical symposiums,
              student club governance, and seamless attendance verification.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Campus Services & REST APIs Online</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/events" className="hover:text-indigo-400 transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="hover:text-indigo-400 transition-colors">
                  Student Clubs & Societies
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-400 transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/dashboard/student" className="hover:text-indigo-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/coordinator" className="hover:text-indigo-400 transition-colors">
                  Coordinator Studio
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" className="hover:text-indigo-400 transition-colors">
                  Admin Analytics
                </Link>
              </li>
              <li className="flex items-center gap-1 text-[11px] text-slate-400">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>Role-Based Access Protected</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} CampusConnect. Production-Ready Academic Platform.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for campus life.
          </p>
        </div>
      </div>
    </footer>
  );
};
