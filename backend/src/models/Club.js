const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Club name cannot exceed 100 characters'],
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
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Technical',
        'Cultural',
        'Sports',
        'Literary',
        'Social & Outreach',
        'Entrepreneurship',
        'Arts & Media',
      ],
      index: true,
    },
    logo: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Coordinator is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    meetingSchedule: {
      type: String,
      default: 'Every Wednesday at 5:00 PM',
    },
    location: {
      type: String,
      default: 'Student Activity Center',
    },
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for member count
clubSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// Auto generate slug
clubSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

module.exports = mongoose.model('Club', clubSchema);
