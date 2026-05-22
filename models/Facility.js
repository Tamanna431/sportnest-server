const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Facility name is required'],
    trim: true
  },
  facility_type: {
    type: String,
    required: [true, 'Facility type is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Image URL is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  price_per_hour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  available_slots: {
    type: [String],
    required: [true, 'Available time slots are required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  owner_email: {
    type: String,
    required: [true, 'Owner email is required'],
    lowercase: true,
    trim: true
  },
  booking_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema);
