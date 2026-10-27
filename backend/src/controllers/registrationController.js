const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Club = require('../models/Club');
const { createNotification } = require('../services/notificationService');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const event = await Event.findById(eventId).populate('club', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: `Cannot register: Event is marked as ${event.status}.`,
      });
    }

    const now = new Date();
    if (now > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration closed: The deadline for this event has passed.',
      });
    }

    // Check duplicate active registration
    const existingRegistration = await Registration.findOne({
      event: eventId,
      student: studentId,
    });

    if (existingRegistration && existingRegistration.status === 'registered') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event.',
        ticketNumber: existingRegistration.ticketNumber,
      });
    }

    // Check capacity atomically
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Event is at full capacity. No more seats available.',
      });
    }

    let registration;

    if (existingRegistration && existingRegistration.status === 'cancelled') {
      // Re-activate previously cancelled registration
      existingRegistration.status = 'registered';
      existingRegistration.attendanceStatus = 'unmarked';
      existingRegistration.cancelledAt = null;
      await existingRegistration.save();
      registration = existingRegistration;
    } else {
      registration = await Registration.create({
        event: eventId,
        student: studentId,
        status: 'registered',
      });
    }

    // Increment registeredCount
    await Event.findByIdAndUpdate(eventId, {
      $inc: { registeredCount: 1 },
    });

    // Send confirmation in-app notification
    await createNotification({
      userId: studentId,
      title: 'Registration Confirmed! 🎟️',
      message: `You are confirmed for "${event.title}" hosted by ${event.club.name}. Ticket: ${registration.ticketNumber}`,
      type: 'registration',
      link: `/events/${event._id}`,
      metadata: {
        eventId: event._id,
        ticketNumber: registration.ticketNumber,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your pass is confirmed.',
      registration,
      availableSeats: Math.max(0, event.capacity - (event.registeredCount + 1)),
    });
  } catch (error) {
    // Catch unique index race condition
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered for this event.',
      });
    }
    next(error);
  }
};

// @desc    Cancel event registration
// @route   POST /api/registrations/:eventId/cancel
// @access  Private
const cancelRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const studentId = req.user._id;

    const registration = await Registration.findOne({
      event: eventId,
      student: studentId,
      status: 'registered',
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No active registration found to cancel.',
      });
    }

    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    // Decrement registered count
    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { registeredCount: -1 } },
      { new: true }
    ).populate('club', 'name');

    // Send cancellation notification
    await createNotification({
      userId: studentId,
      title: 'Registration Cancelled',
      message: `Your registration for "${event ? event.title : 'the event'}" has been cancelled.`,
      type: 'cancellation',
      link: `/events/${eventId}`,
    });

    res.json({
      success: true,
      message: 'Your registration has been cancelled.',
      availableSeats: event ? Math.max(0, event.capacity - event.registeredCount) : 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private (Student)
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({
      student: req.user._id,
    })
      .populate({
        path: 'event',
        populate: {
          path: 'club',
          select: 'name slug logo category',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for an event (Coordinator / Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private (Coordinator or Admin)
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId).populate('club');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Authorization check
    const isCoordinator =
      event.club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCoordinator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view registrations for this event.',
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('student', 'name email department studentId phone avatar')
      .sort({ createdAt: -1 });

    const stats = {
      total: registrations.length,
      active: registrations.filter((r) => r.status === 'registered').length,
      cancelled: registrations.filter((r) => r.status === 'cancelled').length,
      present: registrations.filter((r) => r.attendanceStatus === 'present').length,
      absent: registrations.filter((r) => r.attendanceStatus === 'absent').length,
      unmarked: registrations.filter(
        (r) => r.status === 'registered' && r.attendanceStatus === 'unmarked'
      ).length,
    };

    res.json({
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
      },
      stats,
      registrations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance status for a registration
// @route   PATCH /api/registrations/:registrationId/attendance
// @access  Private (Coordinator or Admin)
const updateAttendanceStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { attendanceStatus } = req.body;

    if (!['unmarked', 'present', 'absent'].includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance status. Must be unmarked, present, or absent.',
      });
    }

    const registration = await Registration.findById(registrationId)
      .populate({
        path: 'event',
        populate: { path: 'club' },
      })
      .populate('student', 'name email');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration record not found.',
      });
    }

    const isCoordinator =
      registration.event.club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCoordinator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to mark attendance for this event.',
      });
    }

    registration.attendanceStatus = attendanceStatus;
    if (attendanceStatus === 'present') {
      registration.attendedAt = new Date();
    } else {
      registration.attendedAt = null;
    }

    await registration.save();

    // Notify student if marked present
    if (attendanceStatus === 'present') {
      await createNotification({
        userId: registration.student._id,
        title: 'Attendance Verified! ✅',
        message: `Your attendance for "${registration.event.title}" has been verified. Thanks for participating!`,
        type: 'attendance',
        link: `/events/${registration.event._id}`,
      });
    }

    res.json({
      success: true,
      message: `Attendance marked as ${attendanceStatus}.`,
      registration,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  updateAttendanceStatus,
};
