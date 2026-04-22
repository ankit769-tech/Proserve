const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Service = require('../models/Service');

const router = express.Router();

// ------------------------------
// GET ALL SERVICES (Public)
// ------------------------------
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('worker', 'name rating workerProfile');
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// GET SERVICE BY ID (Service Details Page)
// ------------------------------
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('worker', 'name email rating profile workerProfile');

    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// WORKER — CREATE SERVICE
// ------------------------------
router.post('/', auth, role('worker'), async (req, res) => {
  try {
    const { title, description, category, price, durationMin } = req.body;

    const newService = new Service({
      title,
      description,
      category,
      price,
      durationMin,
      worker: req.user._id
    });

    await newService.save();

    res.json({
      message: "Service created successfully",
      service: newService
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// WORKER — DELETE SERVICE
// ------------------------------
router.delete('/:id', auth, role('worker'), async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      worker: req.user._id
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found or unauthorized" });
    }

    await Service.findByIdAndDelete(service._id);

    res.json({ message: "Service deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
