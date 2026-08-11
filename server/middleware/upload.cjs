/**
 * Multer File Upload Middleware
 * 
 * Configures storage path and file naming.
 * Automatically creates target directory if it does not exist.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer memory storage configuration for cloud uploads
const storage = multer.memoryStorage();

// File filter (restrict to images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Faqat rasm formatidagi fayllarni yuklash mumkin (jpeg, jpg, png, gif, webp, svg)!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  fileFilter: fileFilter
});

module.exports = upload;
