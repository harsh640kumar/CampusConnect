const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Get all clubs with filtering & search
// @route   GET /api/clubs
// @access  Public
const getClubs = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;

    const query = {};

    // Only admins can see inactive/pending clubs unless explicit
    if (status && req.user && req.user.role === 'admin') {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const clubs = await Club.find(query)
      .populate('coordinator', 'name email department avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club by ID or slug
// @route   GET /api/clubs/:idOrSlug
// @access  Public
const getClubByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const club = await Club.findOne(query)
      .populate('coordinator', 'name email department avatar phone')
      .populate('members', 'name email department avatar');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    // Also fetch upcoming events for this club
    const upcomingEvents = await Event.find({
      club: club._id,
      status: { $ne: 'cancelled' },
    })
      .sort({ date: 1 })
      .limit(6);

    res.json({
      success: true,
      club,
      upcomingEvents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private (Admin or Coordinator)
const createClub = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      logo,
      bannerImage,
      coordinatorId,
      contactEmail,
      meetingSchedule,
      location,
      socialLinks,
    } = req.body;

    const existingClub = await Club.findOne({ name });
    if (existingClub) {
      return res.status(409).json({
        success: false,
        message: 'A club with this name already exists.',
      });
    }

    // Determine coordinator
    let coordinator = req.user._id;
    if (req.user.role === 'admin' && coordinatorId) {
      coordinator = coordinatorId;
    }

    const club = await Club.create({
      name,
      description,
      category,
      logo: logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
      coordinator,
      contactEmail: contactEmail || req.user.email,
      meetingSchedule: meetingSchedule || 'Every Wednesday at 5:00 PM',
      location: location || 'Student Activity Center',
      socialLinks: socialLinks || {},
      status: 'active',
      members: [coordinator],
    });

    // Also add club to coordinator's joinedClubs
    await User.findByIdAndUpdate(coordinator, {
      $addToSet: { joinedClubs: club._id },
    });

    res.status(201).json({
      success: true,
      message: 'Club created successfully.',
      club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Admin or Club's Coordinator)
const updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    // Ownership check: Admin or assigned coordinator
    const isOwner = club.coordinator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to edit this club.',
      });
    }

    const allowedUpdates = [
      'name',
      'description',
      'category',
      'logo',
      'bannerImage',
      'contactEmail',
      'meetingSchedule',
      'location',
      'socialLinks',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        club[field] = req.body[field];
      }
    });

    if (isAdmin && req.body.coordinator) {
      club.coordinator = req.body.coordinator;
    }

    await club.save();

    res.json({
      success: true,
      message: 'Club updated successfully.',
      club,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Admin only)
const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    // Cancel related events
    await Event.updateMany({ club: club._id }, { status: 'cancelled' });

    await club.deleteOne();

    res.json({
      success: true,
      message: 'Club and associated events have been deleted.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a club
// @route   POST /api/clubs/:id/join
// @access  Private
const joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    const userId = req.user._id;

    // Check if already a member
    if (club.members.some((m) => m.toString() === userId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club.',
      });
    }

    club.members.push(userId);
    await club.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedClubs: club._id },
    });

    // Notify coordinator
    await createNotification({
      userId: club.coordinator,
      title: 'New Member Joined!',
      message: `${req.user.name} joined ${club.name}.`,
      type: 'club',
      link: `/clubs/${club._id}`,
    });

    // Notify student
    await createNotification({
      userId,
      title: `Welcome to ${club.name}! 🚀`,
      message: `You are now a member of ${club.name}. Check out upcoming club activities!`,
      type: 'club',
      link: `/clubs/${club._id}`,
    });

    res.json({
      success: true,
      message: `Successfully joined ${club.name}!`,
      memberCount: club.members.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a club
// @route   POST /api/clubs/:id/leave
// @access  Private
const leaveClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found.',
      });
    }

    const userId = req.user._id;

    club.members = club.members.filter((m) => m.toString() !== userId.toString());
    await club.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { joinedClubs: club._id },
    });

    res.json({
      success: true,
      message: `You have left ${club.name}.`,
      memberCount: club.members.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get clubs coordinated by current user
// @route   GET /api/clubs/my/coordinated
// @access  Private (Coordinator or Admin)
const getMyCoordinatedClubs = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { coordinator: req.user._id };
    const clubs = await Club.find(query).populate('members', 'name email department');

    res.json({
      success: true,
      clubs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubs,
  getClubByIdOrSlug,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
  getMyCoordinatedClubs,
};
