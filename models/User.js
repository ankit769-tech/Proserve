const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
  holderName: String,
  bankName: String,
  accNo: String,
  ifsc: String,
  upi: String,
  addedAt: { type: Date, default: Date.now }
});

const WorkerProfileSchema = new mongoose.Schema({
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }], // services created by worker
  experience: String,
  verified: { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  bankAccounts: [BankSchema],
  availability: { type: mongoose.Schema.Types.Mixed }, // store weekly availability object
  earningsTotal: { type: Number, default: 0 },
  todayJobsCount: { type: Number, default: 0 }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer','worker','admin'], default: 'customer' },
  profile: {
    city: String,
    bio: String,
    photo: String,
  },
  workerProfile: WorkerProfileSchema,
  rating: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
