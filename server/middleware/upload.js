/**
 * @fileoverview File upload middleware using multer.
 * Configures disk storage for event poster uploads with file type validation.
 * @module middleware/upload
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'posters');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * Files are stored in uploads/posters/ with a unique timestamp-based filename.
 */
const storage = multer.diskStorage({
  /**
   * Sets the destination directory for uploaded files.
   * @param {import('express').Request} req - Express request object
   * @param {Express.Multer.File} file - The uploaded file
   * @param {Function} cb - Callback function (error, destination)
   */
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  /**
   * Generates a unique filename using the current timestamp and original extension.
   * @param {import('express').Request} req - Express request object
   * @param {Express.Multer.File} file - The uploaded file
   * @param {Function} cb - Callback function (error, filename)
   */
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter to accept only image files.
 * Allowed MIME types: jpeg, jpg, png, gif, webp.
 * @param {import('express').Request} req - Express request object
 * @param {Express.Multer.File} file - The uploaded file
 * @param {Function} cb - Callback function (error, accept)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WEBP images are allowed.'),
      false
    );
  }
};

/**
 * Configured multer upload middleware.
 * - Storage: disk (uploads/posters/)
 * - File size limit: 5 MB
 * - File filter: images only
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
