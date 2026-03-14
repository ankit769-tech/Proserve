const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

const router = express.Router();

// -----------------------------------
// CUSTOMER — CREATE BOOKING
// -----------------------------------
router.post('/', auth, role('customer'), async (req, res) => {
  try {
    const { serviceId, date, timeSlot, notes } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const booking = new Booking({
      customer: req.user._id,
      worker: service.worker,
      service: service._id,
      date,
      timeSlot,
      notes,
      price: service.price
    });

    await booking.save();

    res.json({
      message: "Booking created",
      booking
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------
// GET BOOKING BY ID (Booking Confirmation Page)
// -----------------------------------
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('worker', 'name rating phone workerProfile')
      .populate('service');

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------
// WORKER — ACCEPT BOOKING
// -----------------------------------
router.post('/:id/accept', auth, role('worker'), async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.worker) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking accepted", booking });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------
// WORKER — REJECT BOOKING
// -----------------------------------
router.post('/:id/reject', auth, role('worker'), async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (String(booking.worker) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected", booking });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------
// CUSTOMER — ALL BOOKINGS
// -----------------------------------
router.get('/', auth, role('customer'), async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate('service')
      .populate('worker', 'name email phone');

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------------
// WORKER — TODAY's JOBS
// (for worker-todays-jobs.html)
// -----------------------------------
router.get('/worker/today', auth, role('worker'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    const bookings = await Booking.find({
      worker: req.user._id,
      date: { $gte: today }
    })
    .populate('customer', 'name phone')
    .populate('service');

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
