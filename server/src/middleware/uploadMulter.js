const multer = require('multer');
const { uploadFromBuffer } = require('../services/cloudinaryService');

// Cloudinary upload_stream docs:
// https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters
// Multer docs:
// https://github.com/expressjs/multer#readme

const FIVE_MB = 5 * 1024 * 1024;
const TEN_MB = 10 * 1024 * 1024;

// MemoryStorage keeps file buffer in memory to pipe to Cloudinary
const storage = multer.memoryStorage();

// Generic file filter factory
function createFileFilter(allowedMimes) {
  return (req, file, cb) => {
    if (!allowedMimes || allowedMimes.length === 0) return cb(null, true);
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Invalid file type'));
  };
}

// Avatar: images only, up to 5MB
const avatarUpload = multer({
  storage,
  limits: { fileSize: FIVE_MB },
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
}).single('avatar');

// Resume: allow common document types, up to 10MB
const resumeUpload = multer({
  storage,
  limits: { fileSize: TEN_MB },
  fileFilter: createFileFilter([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ])
}).single('resume');

// Gallery: images array, each up to 5MB
const galleryUpload = multer({
  storage,
  limits: { fileSize: FIVE_MB },
  fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
}).array('gallery', 10);

// Helpers to pipe buffer to Cloudinary inside route handlers
async function uploadBufferToCloudinary(file, folder, options = {}) {
  if (!file || !file.buffer) {
    const err = new Error('No file buffer provided');
    err.statusCode = 400;
    throw err;
  }
  return uploadFromBuffer(file.buffer, folder, options);
}

module.exports = {
  avatarUpload,
  resumeUpload,
  galleryUpload,
  uploadBufferToCloudinary
};


