const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event is required'],
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled'],
      default: 'registered',
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ['unmarked', 'present', 'absent'],
      default: 'unmarked',
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    attendedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate registrations for the same student and event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

// Auto-generate ticket number
registrationSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `CC-${Date.now().toString().slice(-4)}-${randomHex}`;
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
