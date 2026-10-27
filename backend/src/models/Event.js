const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Event title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Organizing club is required'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: [
        'Workshop',
        'Hackathon',
        'Seminar',
        'Cultural',
        'Sports',
        'Networking',
        'Competition',
        'General',
      ],
      index: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '01:00 PM',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1 attendee'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    bannerImage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available seats
eventSchema.virtual('availableSeats').get(function () {
  return Math.max(0, this.capacity - (this.registeredCount || 0));
});

// Virtual for isRegistrationOpen
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  const deadline = new Date(this.registrationDeadline);
  return (
    this.status === 'upcoming' &&
    now <= deadline &&
    (this.registeredCount || 0) < this.capacity
  );
});

// Slug generator
eventSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-')
        .slice(0, 80) +
      '-' +
      randomSuffix;
  }
  next();
});

// Text index for search
eventSchema.index({ title: 'text', description: 'text', venue: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
