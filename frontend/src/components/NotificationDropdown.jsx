import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Calendar,
  Ticket,
  CheckCircle2,
  XCircle,
  Users,
  Trash2,
} from 'lucide-react';

export const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'registration':
        return <Ticket className="w-4 h-4 text-emerald-400" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4 text-indigo-400" />;
      case 'club':
        return <Users className="w-4 h-4 text-purple-400" />;
      default:
        return <Calendar className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div
      id="notification-panel"
      className="absolute right-0 mt-3 w-84 sm:w-96 rounded-2xl glass-panel shadow-2xl border border-slate-700/60 p-4 z-50 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="font-semibold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllAsRead}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto custom-scrollbar mt-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-xs font-medium">No notifications yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Updates about registrations and events will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markAsRead(n._id);
                setIsOpen(false);
              }}
              className={`p-3 transition-colors rounded-xl mt-1 cursor-pointer flex items-start gap-3 ${
                n.isRead
                  ? 'hover:bg-slate-800/40 opacity-75'
                  : 'bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-500/20'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800/80 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-block text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-1.5"
                  >
                    View details →
                  </Link>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
                className="text-slate-500 hover:text-rose-400 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                title="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
