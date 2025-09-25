const express = require('express');
const router = express.Router();
const { handleAmpProfileUpdate } = require('../controllers/ampEmailController');

// AMP action-xhr endpoint must support CORS and POST
router.post('/amp-profile-update', handleAmpProfileUpdate);

module.exports = router;


