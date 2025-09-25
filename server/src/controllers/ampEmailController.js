const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Handle AMP form submission from email to quickly update a couple of fields.
 * Requirements for AMP:
 * - Respond to CORS preflight and set appropriate headers
 * - Return JSON with keys readable by Mustache template (e.g., {message})
 */

function setAmpCorsHeaders(req, res) {
  const origin = req.get('Origin') || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  // AMP specific header to allow action-xhr
  res.setHeader('AMP-Access-Control-Allow-Source-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Expose-Headers', 'AMP-Access-Control-Allow-Source-Origin');
}

const handleAmpProfileUpdate = async (req, res) => {
  try {
    setAmpCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(200).send('OK');
    }

    const { email, currentPosition, currentLocation } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof currentPosition === 'string') user.currentPosition = currentPosition;
    if (typeof currentLocation === 'string') user.currentLocation = currentLocation;
    user.lastProfileUpdatedAt = new Date();
    user.computeProfileCompletion();
    await user.save();

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    logger.error('AMP profile update failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { handleAmpProfileUpdate };


