const express = require('express');
const router = express.Router();
const { verifyToken, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { resumeUpload } = require('../middleware/uploadMulter');
const { applyToJob } = require('../controllers/applicationController');
const jobController = require('../controllers/jobController');

// Public job routes (no authentication required)
router.get('/', asyncHandler(jobController.getAllJobs));

router.get('/search', asyncHandler(jobController.searchJobs));

router.get('/:jobId', asyncHandler(jobController.getJobDetails));

router.get('/:jobId/applications', verifyToken, authorize('recruiter', 'admin'), asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Get job applications endpoint - to be implemented'
  });
}));

router.post('/:jobId/apply', verifyToken, authorize('user'), (req, res, next) => {
  resumeUpload(req, res, function(err) {
    if (err) return next(err);
    next();
  });
}, asyncHandler(applyToJob));

router.post('/:jobId/save', verifyToken, authorize('user'), asyncHandler(jobController.saveJobViaJobs));

router.delete('/:jobId/save', verifyToken, authorize('user'), asyncHandler(jobController.removeSavedJobViaJobs));

// Job categories and filters
router.get('/categories/list', asyncHandler(jobController.getJobCategories));

router.get('/locations/list', asyncHandler(jobController.getJobLocations));

router.get('/skills/popular', asyncHandler(jobController.getPopularSkills));

module.exports = router;
