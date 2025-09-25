const express = require('express');
const router = express.Router();
const { verifyToken, authorize, ensureJobOwnerOrAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { getApplicantsWithMatchScore } = require('../controllers/matchController');
const recruiterController = require('../controllers/recruiterController');

// All recruiter routes require authentication and recruiter role
router.use(verifyToken);
router.use(authorize('recruiter', 'admin'));

// Placeholder recruiter routes - to be implemented with controllers
router.get('/dashboard', asyncHandler(recruiterController.getDashboard));

router.get('/jobs', asyncHandler(recruiterController.getRecruiterJobs));

router.post('/jobs', asyncHandler(recruiterController.createJob));

router.put('/jobs/:jobId', asyncHandler(recruiterController.updateJob));

router.delete('/jobs/:jobId', asyncHandler(recruiterController.deleteJob));

router.get('/job/:jobId/applicants', ensureJobOwnerOrAdmin, asyncHandler(getApplicantsWithMatchScore));

router.put('/applications/:applicationId/status', asyncHandler(recruiterController.updateApplicationStatus));

router.get('/candidates', asyncHandler(recruiterController.searchCandidates));

router.get('/candidates/:candidateId', asyncHandler(recruiterController.getCandidateProfile));

module.exports = router;
