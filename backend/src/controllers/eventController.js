const Event = require('../models/Event');
const Club = require('../models/Club');
const Registration = require('../models/Registration');
const { createNotification } = require('../services/notificationService');

// @desc    Get all events with search, filters, and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      club,
      dateFilter,
      startDate,
      endDate,
      sort = 'date_asc',
      page = 1,
      limit = 9,
    } = req.query;

    const query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // By default show upcoming and ongoing
      query.status = { $in: ['upcoming', 'ongoing'] };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Club filter
    if (club) {
      query.club = club;
    }

    // Date range filters
    const now = new Date();
    if (dateFilter === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (dateFilter === 'this_week') {
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      query.date = { $gte: new Date(), $lte: endOfWeek };
    } else if (dateFilter === 'this_month') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      query.date = { $gte: new Date(), $lte: endOfMonth };
    } else if (dateFilter === 'past') {
      query.date = { $lt: new Date() };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions = { date: 1 };
    if (sort === 'date_desc') sortOptions = { date: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    if (sort === 'capacity_desc') sortOptions = { capacity: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const pageLimit = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * pageLimit;

    const totalEvents = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('club', 'name slug logo category')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    // If user is logged in, attach registration info
    let registeredEventIds = new Set();
    if (req.user) {
      const userRegistrations = await Registration.find({
        student: req.user._id,
        status: 'registered',
      }).select('event');
      registeredEventIds = new Set(
        userRegistrations.map((r) => r.event.toString())
      );
    }

    const eventsWithMeta = events.map((event) => {
      const plain = event.toObject();
      plain.isUserRegistered = registeredEventIds.has(event._id.toString());
      return plain;
    });

    res.json({
      success: true,
      count: events.length,
      totalEvents,
      totalPages: Math.ceil(totalEvents / pageLimit),
      currentPage: pageNum,
      events: eventsWithMeta,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res, next) => {
  try {
    const featured = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() },
    })
      .populate('club', 'name slug logo category')
      .sort({ registeredCount: -1, date: 1 })
      .limit(3);

    res.json({
      success: true,
      events: featured,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID or slug
// @route   GET /api/events/:idOrSlug
// @access  Public
const getEventByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const event = await Event.findOne(query)
      .populate({
        path: 'club',
        select: 'name slug logo bannerImage category coordinator contactEmail',
        populate: {
          path: 'coordinator',
          select: 'name email avatar phone',
        },
      })
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({
        event: event._id,
        student: req.user._id,
      });
    }

    const plainEvent = event.toObject();
    plainEvent.userRegistration = userRegistration;

    res.json({
      success: true,
      event: plainEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Coordinator or Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      clubId,
      category,
      venue,
      date,
      startTime,
      endTime,
      capacity,
      registrationDeadline,
      bannerImage,
      tags,
      isFeatured,
    } = req.body;

    // Verify club exists
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Organizing club not found.',
      });
    }

    // Ownership check: Coordinator must coordinate this club, or user is admin
    const isClubCoordinator =
      club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClubCoordinator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only create events for clubs you coordinate.',
      });
    }

    // Validate registration deadline is before or on event date
    const eventDate = new Date(date);
    const deadlineDate = new Date(registrationDeadline);
    if (deadlineDate > eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline cannot be after the event date.',
      });
    }

    const event = await Event.create({
      title,
      description,
      club: club._id,
      category,
      venue,
      date: eventDate,
      startTime: startTime || '10:00 AM',
      endTime: endTime || '01:00 PM',
      capacity: Number(capacity),
      registrationDeadline: deadlineDate,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      tags: tags || [],
      isFeatured: Boolean(isFeatured),
      createdBy: req.user._id,
    });

    // Notify club members about the new event
    if (club.members && club.members.length > 0) {
      const memberNotifications = club.members
        .filter((memberId) => memberId.toString() !== req.user._id.toString())
        .map((memberId) => ({
          user: memberId,
          title: `New Event from ${club.name}! 📅`,
          message: `${club.name} announced "${event.title}" on ${eventDate.toLocaleDateString()}. Register before spots fill up!`,
          type: 'reminder',
          link: `/events/${event._id}`,
          metadata: { eventId: event._id, clubId: club._id },
        }));

      if (memberNotifications.length > 0) {
        const { notifyMany } = require('../services/notificationService');
        await notifyMany(memberNotifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Coordinator or Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Ownership check
    const isCoordinator =
      event.club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCoordinator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this event.',
      });
    }

    const {
      title,
      description,
      category,
      venue,
      date,
      startTime,
      endTime,
      capacity,
      registrationDeadline,
      bannerImage,
      tags,
      status,
      isFeatured,
    } = req.body;

    if (capacity !== undefined && Number(capacity) < event.registeredCount) {
      return res.status(400).json({
        success: false,
        message: `Capacity cannot be reduced below current registered attendees (${event.registeredCount}).`,
      });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (venue) event.venue = venue;
    if (date) event.date = new Date(date);
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (capacity !== undefined) event.capacity = Number(capacity);
    if (registrationDeadline) event.registrationDeadline = new Date(registrationDeadline);
    if (bannerImage) event.bannerImage = bannerImage;
    if (tags) event.tags = tags;
    if (status) event.status = status;
    if (isFeatured !== undefined) event.isFeatured = isFeatured;

    await event.save();

    res.json({
      success: true,
      message: 'Event updated successfully.',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Cancel an event
// @route   DELETE /api/events/:id
// @access  Private (Coordinator or Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('club');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const isCoordinator =
      event.club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCoordinator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this event.',
      });
    }

    // Cancel registrations and notify attendees
    const registrations = await Registration.find({
      event: event._id,
      status: 'registered',
    });

    await Registration.updateMany(
      { event: event._id },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    // Notify registered students
    const cancellationNotifications = registrations.map((r) => ({
      user: r.student,
      title: `Event Cancelled: ${event.title}`,
      message: `We regret to inform you that "${event.title}" organized by ${event.club.name} has been cancelled.`,
      type: 'cancellation',
      link: '/events',
    }));

    if (cancellationNotifications.length > 0) {
      const { notifyMany } = require('../services/notificationService');
      await notifyMany(cancellationNotifications);
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event and associated registrations deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coordinator's managed events with registration stats
// @route   GET /api/events/coordinator/my-events
// @access  Private (Coordinator or Admin)
const getMyCoordinatedEvents = async (req, res, next) => {
  try {
    let clubIds = [];

    if (req.user.role === 'admin') {
      const allClubs = await Club.find({}).select('_id');
      clubIds = allClubs.map((c) => c._id);
    } else {
      const myClubs = await Club.find({ coordinator: req.user._id }).select('_id');
      clubIds = myClubs.map((c) => c._id);
    }

    const events = await Event.find({ club: { $in: clubIds } })
      .populate('club', 'name slug logo')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getFeaturedEvents,
  getEventByIdOrSlug,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyCoordinatedEvents,
};
