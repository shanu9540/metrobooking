const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    fromStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    toStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true
    },
    lineName: {
      type: String,
      required: true,
      trim: true
    },
    distance: {
      type: Number,
      required: [true, 'Distance in km is required'],
      min: 0
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate connections in the same direction on the same line
routeSchema.index({ fromStation: 1, toStation: 1, lineName: 1 }, { unique: true });

const Route = mongoose.model('Route', routeSchema);
module.exports = Route;
