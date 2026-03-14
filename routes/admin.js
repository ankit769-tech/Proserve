const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const User = require('../models/User');

const router = express.Router();

// ------------------------------------
// GET ALL WORKERS (For admin panel)
// ------------------------------------
router.get('/workers', auth, role('admin'), async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------
// UPDATE WORKER VERIFICATION
// ------------------------------------
router.put('/verify-worker/:id', auth, role('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { "workerProfile.verificationStatus": status } },
      { new: true }
    );

    res.json({
      message: "Worker status updated",
      worker
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------------
// DELETE USER (customer/worker)
// ------------------------------------
router.delete('/delete-user/:id', auth, role('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
