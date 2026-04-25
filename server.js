require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const ExcelJS = require('exceljs');

// Import Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Contact form submission handler
app.post('/submit-contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const filePath = 'contacts.xlsx';

    const workbook = new ExcelJS.Workbook();
    let sheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      sheet = workbook.getWorksheet('Sheet1');
    } else {
      sheet = workbook.addWorksheet('Sheet1');
      sheet.addRow(['Name', 'Email', 'Phone', 'Message']);
    }

    sheet.addRow([
      name || '',
      email || '',
      phone || '',
      message || ''
    ]);
    await workbook.xlsx.writeFile(filePath);

    res.send('Thank you! Your response has been recorded.');
  } catch (err) {
    console.error('Error saving contact:', err);
    if (err.code === 'EBUSY') {
      return res.status(503).send('The contacts file is currently open in another program. Please close it and try again.');
    }
    res.status(500).send('Failed to save contact. Please try again later.');
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route for SPA / ALL OTHER ROUTES (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

