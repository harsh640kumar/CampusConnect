import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Tag, Image, Clock, Check } from 'lucide-react';

export const CreateEventModal = ({
  isOpen,
  onClose,
  onSubmit,
  clubs = [],
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clubId: '',
    category: 'Workshop',
    venue: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    capacity: 100,
    registrationDeadline: '',
    bannerImage: '',
    tags: '',
    isFeatured: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        clubId: initialData.club?._id || initialData.club || (clubs[0]?._id || ''),
        category: initialData.category || 'Workshop',
        venue: initialData.venue || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        startTime: initialData.startTime || '10:00 AM',
        endTime: initialData.endTime || '01:00 PM',
        capacity: initialData.capacity || 100,
        registrationDeadline: initialData.registrationDeadline
          ? new Date(initialData.registrationDeadline).toISOString().split('T')[0]
          : '',
        bannerImage: initialData.bannerImage || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        isFeatured: initialData.isFeatured || false,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        clubId: clubs[0]?._id || '',
        category: 'Workshop',
        venue: '',
        date: '',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        capacity: 100,
        registrationDeadline: '',
        bannerImage: '',
        tags: '',
        isFeatured: false,
      });
    }
    setErrors({});
  }, [initialData, clubs, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Event title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.clubId) errs.clubId = 'Organizing club is required';
    if (!formData.venue.trim()) errs.venue = 'Venue is required';
    if (!formData.date) errs.date = 'Event date is required';
    if (!formData.registrationDeadline)
      errs.registrationDeadline = 'Registration deadline is required';
    if (formData.date && formData.registrationDeadline) {
      if (new Date(formData.registrationDeadline) > new Date(formData.date)) {
        errs.registrationDeadline = 'Deadline cannot be after event date';
      }
    }
    if (!formData.capacity || Number(formData.capacity) < 1) {
      errs.capacity = 'Capacity must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      capacity: Number(formData.capacity),
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    onSubmit(payload);
  };

  return (
    <div
      id="create-event-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-slate-700/80 p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {initialData ? 'Edit Event Details' : 'Create New Campus Event'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Publish university gatherings, competitions, seminars, and club activities.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              id="event-title-input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI & Robotics Innovation Showcase"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Club & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Organizing Club *
              </label>
              <select
                id="event-club-select"
                value={formData.clubId}
                onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled>Select organizing club</option>
                {clubs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.clubId && <p className="text-[11px] text-rose-400 mt-1">{errors.clubId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category *
              </label>
              <select
                id="event-category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Networking">Networking</option>
                <option value="Competition">Competition</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Highlights *
            </label>
            <textarea
              id="event-description-input"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline event agenda, speaker details, and student perks..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Venue & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Venue Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="event-venue-input"
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Auditorium Hall 1 / Turing Lab"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.venue && <p className="text-[11px] text-rose-400 mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Attendee Capacity *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="event-capacity-input"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              {errors.capacity && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Event Date *
              </label>
              <input
                id="event-date-input"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.date && <p className="text-[11px] text-rose-400 mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Registration Deadline *
              </label>
              <input
                id="event-deadline-input"
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, registrationDeadline: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {errors.registrationDeadline && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.registrationDeadline}</p>
              )}
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Start Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  placeholder="10:00 AM"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                End Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  placeholder="01:00 PM"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Banner Image URL & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Banner Image URL (optional)
              </label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Hackathon, AI, Web3, Prizes"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="event-form-submit-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {initialData ? 'Update Event' : 'Publish Event'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
