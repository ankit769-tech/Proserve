const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
