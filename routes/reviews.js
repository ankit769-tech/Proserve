const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const router = express.Router();

// ------------------------------------
// POST REVIEW (after booking completed)
// ------------------------------------
router.post('/', auth, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only customer can review
    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const review = new Review({
      booking: bookingId,
      service: booking.service,
      worker: booking.worker,
      customer: req.user._id,
      rating,
      comment
    });

    await review.save();

    res.json({
      message: "Review added",
      review
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
