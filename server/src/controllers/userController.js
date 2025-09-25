const Application = require('../models/Application');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const User = require('../models/User');
const { applyToJob } = require('./applicationController');

/**
 * GET /api/users/applications
 * Get all applications for the current user
 */
async function getUserApplications(req, res) {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sortBy = 'appliedAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = { user: userId };
    
    if (status && ['applied', 'reviewing', 'rejected', 'hired'].includes(status)) {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const totalApplications = await Application.countDocuments(filter);

    // Get applications with pagination
    const applications = await Application.find(filter)
      .populate('job', 'title description location remote salaryRange requiredSkills experienceMin experienceMax status createdAt')
      .populate('job.recruiter', 'firstName lastName company.name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalApplications / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch applications',
      error: err.message 
    });
  }
}

/**
 * POST /api/users/applications/:jobId
 * Apply to a job via users route (alternative to jobs/:jobId/apply)
 */
async function applyToJobViaUsers(req, res) {
  // Delegate to the existing applyToJob function
  return applyToJob(req, res);
}

/**
 * GET /api/users/saved-jobs
 * Get user's saved jobs
 */
async function getSavedJobs(req, res) {
  try {
    const userId = req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'savedAt', 
      sortOrder = 'desc' 
    } = req.query;

    console.log('Debug - getSavedJobs:', { userId, page, limit });

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const totalSavedJobs = await SavedJob.countDocuments({ user: userId });
    console.log('Debug - totalSavedJobs:', totalSavedJobs);

    // Get saved jobs with pagination
    const savedJobs = await SavedJob.find({ user: userId })
      .populate('job', 'title description location remote salaryRange requiredSkills experienceMin experienceMax status createdAt')
      .populate('job.recruiter', 'firstName lastName company.name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean();

    console.log('Debug - savedJobs found:', savedJobs.length);

    // Calculate pagination info
    const totalPages = Math.ceil(totalSavedJobs / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      success: true,
      data: {
        savedJobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSavedJobs,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    console.error('Error in getSavedJobs:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch saved jobs',
      error: err.message 
    });
  }
}

/**
 * POST /api/users/saved-jobs/:jobId
 * Save a job
 */
async function saveJob(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    console.log('Debug - saveJob:', { userId, jobId });

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Job is not available for saving'
      });
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({ user: userId, job: jobId });
    if (existingSavedJob) {
      return res.status(409).json({
        success: false,
        message: 'Job is already saved',
        debug: { existingSavedJobId: existingSavedJob._id }
      });
    }

    // Save the job
    const savedJob = new SavedJob({
      user: userId,
      job: jobId
    });

    await savedJob.save();
    console.log('Debug - savedJob created:', savedJob._id);

    // Populate the job details
    await savedJob.populate('job', 'title description location remote salaryRange requiredSkills experienceMin experienceMax status createdAt');
    await savedJob.populate('job.recruiter', 'firstName lastName company.name');

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (err) {
    console.error('Error in saveJob:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Job is already saved'
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save job',
      error: err.message 
    });
  }
}

/**
 * DELETE /api/users/saved-jobs/:jobId
 * Remove saved job
 */
async function removeSavedJob(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    console.log('Debug - removeSavedJob:', { userId, jobId });

    // Validate jobId format (MongoDB ObjectId)
    if (!jobId || !/^[0-9a-fA-F]{24}$/.test(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
        debug: { jobId }
      });
    }

    // First check if the saved job exists
    const existingSavedJob = await SavedJob.findOne({ user: userId, job: jobId });
    console.log('Debug - existingSavedJob:', existingSavedJob);

    if (!existingSavedJob) {
      // Let's also check if there are any saved jobs for this user at all
      const userSavedJobs = await SavedJob.find({ user: userId }).select('job');
      console.log('Debug - userSavedJobs:', userSavedJobs.map(sj => sj.job.toString()));
      
      return res.status(404).json({
        success: false,
        message: 'Saved job not found',
        debug: { 
          userId, 
          jobId,
          userHasSavedJobs: userSavedJobs.length > 0,
          userSavedJobIds: userSavedJobs.map(sj => sj.job.toString())
        }
      });
    }

    const savedJob = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    
    return res.json({
      success: true,
      message: 'Job removed from saved list',
      data: { removedJobId: savedJob._id }
    });
  } catch (err) {
    console.error('Error in removeSavedJob:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to remove saved job',
      error: err.message 
    });
  }
}

module.exports = {
  getUserApplications,
  applyToJobViaUsers,
  getSavedJobs,
  saveJob,
  removeSavedJob
};
