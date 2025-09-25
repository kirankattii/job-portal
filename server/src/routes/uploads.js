const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { avatarUpload, resumeUpload, uploadBufferToCloudinary } = require('../middleware/uploadMulter');

// References:
// Cloudinary Node SDK upload_stream: https://cloudinary.com/documentation/image_upload_api_reference#upload_optional_parameters
// Multer usage: https://github.com/expressjs/multer#readme

// POST /api/uploads/avatar - Protected (user)
router.post('/avatar', verifyToken, authorize('user'), (req, res) => {
  avatarUpload(req, res, async (err) => {
    try {
      if (err) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const result = await uploadBufferToCloudinary(req.file, `users/${req.user._id}/avatar`, {
        folder: `users/${req.user._id}/avatar`,
        transformation: [{ width: 512, height: 512, crop: 'limit' }]
      });

      // Optionally persist avatarUrl on user
      await User.findByIdAndUpdate(req.user._id, { avatarUrl: result.secure_url }, { new: true });

      return res.status(201).json({
        success: true,
        data: {
          secure_url: result.secure_url,
          public_id: result.public_id
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

// POST /api/uploads/resume - Protected (user) - raw file
router.post('/resume', verifyToken, authorize('user'), (req, res) => {
  resumeUpload(req, res, async (err) => {
    try {
      if (err) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const result = await uploadBufferToCloudinary(req.file, `users/${req.user._id}/resume`, {
        folder: `users/${req.user._id}/resume`,
        resource_type: 'raw'
      });

      const updated = await User.findByIdAndUpdate(
        req.user._id,
        { resumeUrl: result.secure_url },
        { new: true }
      ).select('-password');

      return res.status(201).json({
        success: true,
        data: {
          secure_url: result.secure_url,
          public_id: result.public_id,
          user: updated
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

module.exports = router;


