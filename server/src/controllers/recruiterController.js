const Job = require('../models/Job');
const User = require('../models/User');
const { enqueueTask } = require('../utils/queue');
const { runMatchForJob } = require('../jobs/matchingWorker');
const Application = require('../models/Application');

/**
 * POST /api/recruiter/jobs
 * Create a job posting and enqueue a background matching task.
 */
async function createJob(req, res) {
  try {
    const recruiterId = req.user && req.user._id;

    const {
      title,
      description,
      requiredSkills = [],
      experienceMin,
      experienceMax,
      location,
      remote = false,
      salaryRange
    } = req.body || {};

    // Validate required fields
    if (!title || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required'
      });
    }

    if (experienceMin === undefined || experienceMax === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Experience range (min and max) is required'
      });
    }

    if (!salaryRange || !salaryRange.min || !salaryRange.max) {
      return res.status(400).json({
        success: false,
        message: 'Salary range with min and max values is required'
      });
    }

    // Validate salary range
    if (salaryRange.min < 0 || salaryRange.max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Salary values must be positive'
      });
    }

    if (salaryRange.max < salaryRange.min) {
      return res.status(400).json({
        success: false,
        message: 'Maximum salary must be greater than or equal to minimum salary'
      });
    }

    // Convert experience values to numbers and validate
    const expMin = Number(experienceMin);
    const expMax = Number(experienceMax);

    // Check if conversion was successful
    if (isNaN(expMin) || isNaN(expMax)) {
      return res.status(400).json({
        success: false,
        message: 'Experience values must be valid numbers'
      });
    }

    // Validate experience range
    if (expMin < 0 || expMax < 0) {
      return res.status(400).json({
        success: false,
        message: 'Experience values must be positive'
      });
    }

    // Ensure salary values are numbers and properly formatted
    const salaryMin = Number(salaryRange.min);
    const salaryMax = Number(salaryRange.max);

    console.log('Debug - Salary values:', { 
      original: salaryRange, 
      converted: { min: salaryMin, max: salaryMax },
      types: { minType: typeof salaryMin, maxType: typeof salaryMax }
    });

    const job = new Job({
      recruiter: recruiterId,
      title,
      description,
      requiredSkills,
      experienceMin: expMin,
      experienceMax: expMax,
      location,
      remote,
      salaryRange: {
        min: salaryMin,
        max: salaryMax
      }
    });

    await job.save();

    // Enqueue background matching task
    enqueueTask(async () => {
      await runMatchForJob(job._id);
    });

    return res.status(201).json({
      success: true,
      data: { jobId: job._id, status: 'queued' }
    });
  } catch (err) {
    console.log('Error details:', {
      message: err.message,
      name: err.name,
      errors: err.errors,
      stack: err.stack
    });
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: `Job validation failed: ${errors.join(', ')}`,
        details: err.errors
      });
    }
    
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/recruiter/jobs
 * Get all jobs for the authenticated recruiter with filtering and pagination
 */
async function getRecruiterJobs(req, res) {
  try {
    const recruiterId = req.user && req.user._id;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = { recruiter: recruiterId };
    
    if (status && ['open', 'closed'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
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
      actualApplicantsCount: applicationCountMap[job._id.toString()] || 0
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
 * PUT /api/recruiter/jobs/:jobId
 * Update a job posting
 */
async function updateJob(req, res) {
  try {
    const recruiterId = req.user && req.user._id;
    const { jobId } = req.params;
    const updateData = req.body;

    // Find the job and verify ownership
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to update it'
      });
    }

    // Validate update data
    if (updateData.salaryRange) {
      if (updateData.salaryRange.min < 0 || updateData.salaryRange.max < 0) {
        return res.status(400).json({
          success: false,
          message: 'Salary values must be positive'
        });
      }
      if (updateData.salaryRange.max < updateData.salaryRange.min) {
        return res.status(400).json({
          success: false,
          message: 'Maximum salary must be greater than or equal to minimum salary'
        });
      }
    }

    if (updateData.experienceMin !== undefined || updateData.experienceMax !== undefined) {
      const expMin = updateData.experienceMin !== undefined ? Number(updateData.experienceMin) : job.experienceMin;
      const expMax = updateData.experienceMax !== undefined ? Number(updateData.experienceMax) : job.experienceMax;
      
      // Check if conversion was successful
      if (isNaN(expMin) || isNaN(expMax)) {
        return res.status(400).json({
          success: false,
          message: 'Experience values must be valid numbers'
        });
      }
      
      if (expMin < 0 || expMax < 0) {
        return res.status(400).json({
          success: false,
          message: 'Experience values must be positive'
        });
      }
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    return res.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully'
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false, 
        message: `Job validation failed: ${errors.join(', ')}`,
        details: err.errors
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update job',
      error: err.message 
    });
  }
}

/**
 * DELETE /api/recruiter/jobs/:jobId
 * Delete a job posting
 */
async function deleteJob(req, res) {
  try {
    const recruiterId = req.user && req.user._id;
    const { jobId } = req.params;

    // Find the job and verify ownership
    const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to delete it'
      });
    }

    // Delete all applications for this job first
    await Application.deleteMany({ job: jobId });

    // Delete the job
    await Job.findByIdAndDelete(jobId);

    return res.json({
      success: true,
      message: 'Job and all associated applications deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete job',
      error: err.message 
    });
  }
}

/**
 * PUT /api/recruiter/applications/:applicationId/status
 * Update application status
 */
async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    const recruiterId = req.user && req.user._id;

    // Validate status
    const validStatuses = ['applied', 'reviewing', 'rejected', 'hired'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (applied, reviewing, rejected, hired)'
      });
    }

    // Find the application and verify the recruiter owns the job
    const application = await Application.findById(applicationId)
      .populate('job', 'recruiter title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the recruiter owns the job
    if (application.job.recruiter.toString() !== recruiterId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application'
      });
    }

    // Update the application status
    application.status = status;
    if (notes) {
      application.matchedDetails.notes = notes;
    }
    await application.save();

    return res.json({
      success: true,
      data: {
        applicationId: application._id,
        status: application.status,
        updatedAt: application.updatedAt
      },
      message: 'Application status updated successfully'
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update application status',
      error: err.message 
    });
  }
}

/**
 * GET /api/recruiter/candidates
 * Search and filter candidates
 */
async function searchCandidates(req, res) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      skills, 
      location, 
      experienceMin, 
      experienceMax,
      salaryMin,
      salaryMax,
      sortBy = 'profileCompletion',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object for job seekers only
    const filter = { 
      role: 'user',
      isActive: true,
      profileVisibility: { $in: ['public', 'recruiters-only'] }
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { currentPosition: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Add skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter['skills.name'] = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    // Add location filter
    if (location) {
      filter.$or = [
        { currentLocation: { $regex: location, $options: 'i' } },
        { preferredLocation: { $regex: location, $options: 'i' } },
        { 'location.city': { $regex: location, $options: 'i' } }
      ];
    }

    // Add experience filter
    if (experienceMin !== undefined) {
      filter.experienceYears = { $gte: parseInt(experienceMin) };
    }
    if (experienceMax !== undefined) {
      filter.experienceYears = { ...filter.experienceYears, $lte: parseInt(experienceMax) };
    }

    // Add salary filter
    if (salaryMin !== undefined) {
      filter.expectedSalary = { $gte: parseInt(salaryMin) };
    }
    if (salaryMax !== undefined) {
      filter.expectedSalary = { ...filter.expectedSalary, $lte: parseInt(salaryMax) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get total count for pagination
    const totalCandidates = await User.countDocuments(filter);

    // Get candidates with pagination
    const candidates = await User.find(filter)
      .select('-password -embeddings -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(totalCandidates / limitNum);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCandidates,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to search candidates',
      error: err.message 
    });
  }
}

/**
 * GET /api/recruiter/candidates/:candidateId
 * Get detailed candidate profile
 */
async function getCandidateProfile(req, res) {
  try {
    const { candidateId } = req.params;
    const recruiterId = req.user && req.user._id;

    // Find the candidate
    const candidate = await User.findOne({ 
      _id: candidateId, 
      role: 'user',
      isActive: true,
      profileVisibility: { $in: ['public', 'recruiters-only'] }
    }).select('-password -embeddings -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found or profile is private'
      });
    }

    // Get candidate's applications to jobs posted by this recruiter
    const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id title');
    const jobIds = recruiterJobs.map(job => job._id);
    
    const applications = await Application.find({ 
      user: candidateId, 
      job: { $in: jobIds } 
    })
    .populate('job', 'title status')
    .select('job status appliedAt matchScore matchedDetails')
    .sort({ appliedAt: -1 });

    // Get recent applications to other jobs (last 5)
    const recentApplications = await Application.find({ user: candidateId })
      .populate('job', 'title recruiter')
      .populate('job.recruiter', 'firstName lastName company.name')
      .select('job appliedAt status matchScore')
      .sort({ appliedAt: -1 })
      .limit(5);

    return res.json({
      success: true,
      data: {
        candidate,
        applicationsToYourJobs: applications,
        recentApplications: recentApplications
      }
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch candidate profile',
      error: err.message 
    });
  }
}

module.exports = { 
  createJob, 
  getRecruiterJobs, 
  updateJob, 
  deleteJob, 
  updateApplicationStatus, 
  searchCandidates,
  getCandidateProfile
};

/**
 * GET /api/recruiter/jobs/:jobId/applicants
 * Return applicants with ATS match percentage.
 */
async function listApplicantsWithScores(req, res) {
  try {
    const jobId = req.params.jobId || req.params.id;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const applications = await Application.find({ job: jobId })
      .populate('user', '-password')
      .sort({ matchScore: -1, createdAt: -1 });

    const data = applications.map(a => ({
      applicationId: a._id,
      matchPercentage: a.matchScore || 0,
      user: a.user,
      appliedAt: a.appliedAt,
      status: a.status
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/recruiter/dashboard
 * Get recruiter dashboard statistics and data.
 */
async function getDashboard(req, res) {
  try {
    const recruiterId = req.user && req.user._id;

    // Get basic recruiter info from User model
    const User = require('../models/User');
    const recruiter = await User.findById(recruiterId).select('-password');

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    // Get job statistics
    const jobs = await Job.find({ recruiter: recruiterId });
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(job => job.status === 'open').length;
    const closedJobs = totalJobs - openJobs;

    // Get application statistics
    const applications = await Application.find({ 
      job: { $in: jobs.map(job => job._id) } 
    }).populate('job', 'title');

    const totalApplications = applications.length;
    const applicationsByStatus = {
      applied: applications.filter(app => app.status === 'applied').length,
      reviewing: applications.filter(app => app.status === 'reviewing').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      hired: applications.filter(app => app.status === 'hired').length
    };

    // Get recent applications (last 10)
    const recentApplications = await Application.find({ 
      job: { $in: jobs.map(job => job._id) } 
    })
    .populate('user', 'firstName lastName email')
    .populate('job', 'title')
    .sort({ appliedAt: -1 })
    .limit(10)
    .select('user job appliedAt status matchScore');

    // Get applications by match score ranges
    const matchScoreRanges = {
      high: applications.filter(app => app.matchScore >= 80).length,
      medium: applications.filter(app => app.matchScore >= 50 && app.matchScore < 80).length,
      low: applications.filter(app => app.matchScore < 50).length
    };

    // Get recent jobs (last 5)
    const recentJobs = await Job.find({ recruiter: recruiterId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location status applicantsCount createdAt');

    // Calculate average match score
    const applicationsWithScore = applications.filter(app => app.matchScore > 0);
    const averageMatchScore = applicationsWithScore.length > 0 
      ? Math.round(applicationsWithScore.reduce((sum, app) => sum + app.matchScore, 0) / applicationsWithScore.length)
      : 0;

    // Get applications in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplicationsCount = applications.filter(app => app.appliedAt >= thirtyDaysAgo).length;

    const dashboardData = {
      recruiter: {
        id: recruiter._id,
        name: `${recruiter.firstName} ${recruiter.lastName}`,
        companyName: recruiter.company?.name || 'Not specified',
        email: recruiter.email,
        profileCompletion: recruiter.profileCompletion || 0
      },
      overview: {
        totalJobs,
        openJobs,
        closedJobs,
        totalApplications,
        averageMatchScore,
        recentApplicationsCount
      },
      applications: {
        byStatus: applicationsByStatus,
        byMatchScore: matchScoreRanges
      },
      recentData: {
        applications: recentApplications,
        jobs: recentJobs
      }
    };

    return res.json({
      success: true,
      data: dashboardData
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data',
      error: err.message 
    });
  }
}

module.exports.listApplicantsWithScores = listApplicantsWithScores;
module.exports.getDashboard = getDashboard;
