const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const { protect } = require('../middleware/auth');

// @desc    Get all facilities with Search & Filter
// @route   GET /api/facilities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    let query = {};

    // Implement search by facility name, type, or location using MongoDB $regex
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { facility_type: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Challenge 1: Implement filter by sport type using MongoDB $in
    if (type) {
      const typesArray = type.split(',').map(t => t.trim());
      if (typesArray.length > 0 && typesArray[0] !== '') {
        query.facility_type = { $in: typesArray.map(t => new RegExp('^' + t + '$', 'i')) };
      }
    }

    const facilities = await Facility.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: facilities.length, data: facilities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }
    res.status(200).json({ success: true, data: facility });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid Facility ID' });
  }
});

// @desc    Create new facility
// @route   POST /api/facilities
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, facility_type, image, location, price_per_hour, capacity, available_slots, description } = req.body;

    if (!name || !facility_type || !image || !location || !price_per_hour || !capacity || !available_slots || !description) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Auto-fill owner_email using the authenticated user's email
    const newFacility = await Facility.create({
      name,
      facility_type,
      image,
      location,
      price_per_hour,
      capacity,
      available_slots,
      description,
      owner_email: req.user.email,
      booking_count: 0
    });

    res.status(201).json({ success: true, data: newFacility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Verify ownership
    if (facility.owner_email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this facility' });
    }

    facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: facility });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Verify ownership
    if (facility.owner_email !== req.user.email) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this facility' });
    }

    await Facility.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Facility removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
