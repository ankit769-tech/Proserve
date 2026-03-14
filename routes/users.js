const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// ----------------------------------------------
// GET LOGGED-IN USER PROFILE
// ----------------------------------------------
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// UPDATE USER PROFILE
// ----------------------------------------------
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: "Profile updated",
      user: updated
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// WORKER — UPDATE AVAILABILITY
// ----------------------------------------------
router.put('/me/availability', auth, role('worker'), async (req, res) => {
  try {
    const availability = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { "workerProfile.availability": availability }},
      { new: true }
    );

    res.json({
      message: "Availability updated",
      availability: updated.workerProfile.availability
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// WORKER — ADD BANK ACCOUNT
// ----------------------------------------------
router.post('/me/bank', auth, role('worker'), async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { "workerProfile.bankAccounts": req.body }},
      { new: true }
    );

    res.json({
      message: "Bank added",
      bankAccounts: updated.workerProfile.bankAccounts
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// WORKER — DELETE BANK
// ----------------------------------------------
router.delete('/me/bank/:id', auth, role('worker'), async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { "workerProfile.bankAccounts": { _id: req.params.id } }},
      { new: true }
    );

    res.json({
      message: "Bank removed",
      bankAccounts: updated.workerProfile.bankAccounts
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------
// WORKER — UPLOAD VERIFICATION DOCUMENTS
// ----------------------------------------------
router.post('/me/upload-verification', auth, role('worker'), upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files.map(f => f.path);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { "workerProfile.documents": { $each: files } }},
      { new: true }
    );

    res.json({
      message: "Documents uploaded",
      documents: updated.workerProfile?.documents || []
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ----------------------------------------------
// CHANGE PASSWORD
// ----------------------------------------------
router.put('/me/change-password', auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await User.findById(req.user._id);

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
