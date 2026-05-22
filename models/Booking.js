const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  facility_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: [true, 'Facility ID is required']
  },
  user_email: {
    type: String,
    required: [true, 'User email is required'],
    lowercase: true,
    trim: true
  },
  booking_date: {
    type: String, // Storing as 'YYYY-MM-DD' is standard and extremely easy for comparison & user readability
    required: [true, 'Booking date is required']
  },
  time_slot: {
    type: String, // Example: '08:00 - 09:00'
    required: [true, 'Time slot is required']
  },
  hours: {
    type: Number,
    required: [true, 'Number of hours is required'],
    min: [1, 'Hours must be at least 1']
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
