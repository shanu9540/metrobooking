const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    stationId: {
      type: String,
      required: [true, 'Station ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
      index: true
    },
    lineName: {
      type: [String],
      required: [true, 'Line name is required'],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one line name is required']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      trim: true
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

// Create geospatial index
stationSchema.index({ location: '2dsphere' });

const Station = mongoose.model('Station', stationSchema);
module.exports = Station;
