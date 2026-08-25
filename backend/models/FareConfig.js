const mongoose = require('mongoose');

const fareConfigSchema = new mongoose.Schema(
  {
    minDistance: {
      type: Number,
      required: true,
      min: 0
    },
    maxDistance: {
      type: Number,
      required: true,
      min: 0
    },
    fare: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Enforce unique distance brackets
fareConfigSchema.index({ minDistance: 1, maxDistance: 1 }, { unique: true });

const FareConfig = mongoose.model('FareConfig', fareConfigSchema);
module.exports = FareConfig;
