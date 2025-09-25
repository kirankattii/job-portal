const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const User = require('../models/User');

/**
 * GET /api/jobs
 * Get all available jobs with filtering and pagination
 */
async function getAllJobs(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      location, 
      skills, 
      experienceMin, 
      experienceMax,
      salaryMin,
      salaryMax,
      remote,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object for open jobs only
    const filter = { status: 'open' };
    
    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add location filter
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Add skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter.requiredSkills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    // Add experience filter
    if (experienceMin !== undefined) {
      filter.experienceMin = { $lte: parseInt(experienceMin) };
    }
    if (experienceMax !== undefined) {
      filter.experienceMax = { $gte: parseInt(experienceMax) };
    }

    // Add salary filter
    if (salaryMin !== undefined) {
      filter['salaryRange.min'] = { $gte: parseInt(salaryMin) };
    }
    if (salaryMax !== undefined) {
      filter['salaryRange.max'] = { $lte: parseInt(salaryMax) };
    }

    // Add remote filter
    if (remote !== undefined) {
      filter.remote = remote === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);

    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .populate('recruiter', 'firstName lastName company.name company.logo')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select('-__v')
      .lean();

    // Get application counts for each job
    const jobIds = jobs.map(job => job._id);
    const applicationCounts = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);

    // Create a map of job ID to application count
    const applicationCountMap = {};
    applicationCounts.forEach(item => {
      applicationCountMap[item._id.toString()] = item.count;
    });

    // Add application counts to jobs
    const jobsWithCounts = jobs.map(job => ({
      ...job,
      applicantsCount: applicationCountMap[job._id.toString()] || 0
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalJobs / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      success: true,
      data: {
        jobs: jobsWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch jobs',
      error: err.message 
    });
  }
}

/**
 * GET /api/jobs/search
 * Search jobs with advanced filters
 */
async function searchJobs(req, res) {
  // This is essentially the same as getAllJobs but with more advanced search capabilities
  return getAllJobs(req, res);
}

/**
 * GET /api/jobs/:jobId
 * Get specific job details
 */
async function getJobDetails(req, res) {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('recruiter', 'firstName lastName company.name company.logo company.description company.website')
      .select('-__v');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get application count for this job
    const applicationCount = await Application.countDocuments({ job: jobId });

    // Get job data with application count
    const jobData = {
      ...job.toObject(),
      applicantsCount: applicationCount
    };

    return res.json({
      success: true,
      data: jobData
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job details',
      error: err.message 
    });
  }
}

/**
 * POST /api/jobs/:jobId/save
 * Save a job via jobs route
 */
async function saveJobViaJobs(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

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
        message: 'Job is already saved'
      });
    }

    // Save the job
    const savedJob = new SavedJob({
      user: userId,
      job: jobId
    });

    await savedJob.save();

    // Populate the job details
    await savedJob.populate('job', 'title description location remote salaryRange requiredSkills experienceMin experienceMax status createdAt');
    await savedJob.populate('job.recruiter', 'firstName lastName company.name');

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (err) {
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
 * DELETE /api/jobs/:jobId/save
 * Remove saved job via jobs route
 */
async function removeSavedJobViaJobs(req, res) {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    
    if (!savedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    return res.json({
      success: true,
      message: 'Job removed from saved list'
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to remove saved job',
      error: err.message 
    });
  }
}

/**
 * GET /api/jobs/categories/list
 * Get job categories
 */
async function getJobCategories(req, res) {
  try {
    // This would typically come from a database, but for now we'll return static categories
    const categories = [
      'Software Development',
      'Data Science',
      'Design',
      'Marketing',
      'Sales',
      'Human Resources',
      'Finance',
      'Operations',
      'Customer Support',
      'Product Management',
      'Engineering',
      'Healthcare',
      'Education',
      'Legal',
      'Other'
    ];

    return res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job categories',
      error: err.message 
    });
  }
}

/**
 * GET /api/jobs/locations/list
 * Get job locations
 */
async function getJobLocations(req, res) {
  try {
    // Get unique locations from jobs
    const locations = await Job.distinct('location', { status: 'open' });
    
    return res.json({
      success: true,
      data: locations.sort()
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch job locations',
      error: err.message 
    });
  }
}

/**
 * GET /api/jobs/skills/popular
 * Get popular skills
 */
async function getPopularSkills(req, res) {
  try {
    // Get popular skills from jobs
    const skills = await Job.aggregate([
      { $match: { status: 'open' } },
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { skill: '$_id', count: 1, _id: 0 } }
    ]);

    return res.json({
      success: true,
      data: skills
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch popular skills',
      error: err.message 
    });
  }
}

module.exports = {
  getAllJobs,
  searchJobs,
  getJobDetails,
  saveJobViaJobs,
  removeSavedJobViaJobs,
  getJobCategories,
  getJobLocations,
  getPopularSkills
};
