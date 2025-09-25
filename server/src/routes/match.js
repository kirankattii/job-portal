const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { matchJobForAllUsers } = require('../controllers/matchController');

// Compute matches for a job across users (recruiter/admin only)
router.post('/match-job/:jobId', verifyToken, authorize('recruiter', 'admin'), asyncHandler(matchJobForAllUsers));

module.exports = router;


