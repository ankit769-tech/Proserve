const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // safe filename: timestamp + original name (spaces removed)
    const name = file.originalname.replace(/\s+/g, '-');
    const ext = path.extname(name).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});

// File filter (allow images + pdf)
function fileFilter(req, file, cb) {
  const allowedExt = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return cb(new Error('Only JPG, PNG and PDF files are allowed'), false);
  }
  cb(null, true);
}

// Limits
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
