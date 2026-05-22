const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Facility = require('../models/Facility');
const { protect } = require('../middleware/auth');

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  const { facility_id, booking_date, time_slot, hours, total_price } = req.body;

  if (!facility_id || !booking_date || !time_slot || !hours || !total_price) {
    return res.status(400).json({ success: false, message: 'All booking fields are required' });
  }

  try {
    const facility = await Facility.findById(facility_id);
    if (!facility) {
      return res.status(444).json({ success: false, message: 'Facility not found' });
    }

    // Check if slot already booked for this facility on this date
    const slotExists = await Booking.findOne({
      facility_id,
      booking_date,
      time_slot,
      status: { $ne: 'cancelled' }
    });

    if (slotExists) {
      return res.status(400).json({ success: false, message: 'This slot is already booked for the selected date' });
    }

    const booking = await Booking.create({
      facility_id,
      user_email: req.user.email,
      booking_date,
      time_slot,
      hours,
      total_price,
      status: 'pending' // Default status
    });

    // Increment booking count on facility
    await Facility.findByIdAndUpdate(facility_id, { $inc: { booking_count: 1 } });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get logged-in user's bookings
// @route   GET /api/bookings/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    // Populate facility information
    const bookings = await Booking.find({ user_email: req.user.email })
      .populate('facility_id')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure user owns booking
    if (booking.user_email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Ensure booking isn't already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Decrement booking count on facility (optional but good practice)
    await Facility.findByIdAndUpdate(booking.facility_id, { $inc: { booking_count: -1 } });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
