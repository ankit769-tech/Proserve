const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "09:30"
  status: { 
    type: String, 
    enum: ['pending','confirmed','on_way','in_progress','completed','cancelled','rejected'],
    default: 'pending'
  },
  price: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending','paid','refunded'], default: 'pending' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
