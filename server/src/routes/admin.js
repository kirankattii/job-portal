const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(authorize('admin'));

// Placeholder admin routes - to be implemented with controllers
router.get('/dashboard', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard endpoint - to be implemented'
  });
}));

router.get('/users', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -embeddings') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
}));

router.get('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID
    const user = await User.findById(userId)
      .select('-password -embeddings -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .populate('company', 'name website description');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's applications count
    const Application = require('../models/Application');
    const applicationsCount = await Application.countDocuments({ user: userId });

    // Get user's saved jobs count
    const SavedJob = require('../models/SavedJob');
    const savedJobsCount = await SavedJob.countDocuments({ user: userId });

    // Get recent applications (last 5)
    const recentApplications = await Application.find({ user: userId })
      .populate('job', 'title company location status')
      .populate('job.recruiter', 'firstName lastName company.name')
      .sort({ appliedAt: -1 })
      .limit(5)
      .select('job status appliedAt matchScore');

    const userData = {
      ...user.toObject(),
      statistics: {
        applicationsCount,
        savedJobsCount,
        recentApplications
      }
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
}));

router.put('/users/:userId/status', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, reason } = req.body;

    // Validate input
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive field is required and must be a boolean'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    user.isActive = isActive;
    if (reason) {
      user.statusChangeReason = reason;
    }
    user.statusChangedAt = new Date();
    user.statusChangedBy = req.user._id; // Admin who made the change

    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        email: user.email,
        isActive: user.isActive,
        statusChangedAt: user.statusChangedAt,
        statusChangeReason: user.statusChangeReason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
}));

router.put('/users/:userId/role', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'recruiter', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (user, recruiter, admin)'
      });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
}));

router.delete('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Get related data counts for logging
    const Application = require('../models/Application');
    const SavedJob = require('../models/SavedJob');
    
    const applicationsCount = await Application.countDocuments({ user: userId });
    const savedJobsCount = await SavedJob.countDocuments({ user: userId });

    // Delete related data first
    await Application.deleteMany({ user: userId });
    await SavedJob.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUserId: userId,
        deletedUserEmail: user.email,
        deletedUserRole: user.role,
        deletedAt: new Date(),
        deletedBy: req.user._id,
        reason: reason || 'No reason provided',
        relatedDataDeleted: {
          applications: applicationsCount,
          savedJobs: savedJobsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
}));

router.get('/recruiters', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, verified, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object for recruiters only
    const filter = { role: 'recruiter' };
    
    if (verified !== undefined) {
      filter.isVerified = verified === 'true';
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get recruiters with pagination
    const recruiters = await User.find(filter)
      .select('-password -embeddings -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
      .populate('company', 'name website description logo')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalRecruiters = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalRecruiters / parseInt(limit));
    
    // Get additional statistics for each recruiter
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    
    const recruitersWithStats = await Promise.all(recruiters.map(async (recruiter) => {
      const jobsCount = await Job.countDocuments({ recruiter: recruiter._id });
      const applicationsCount = await Application.countDocuments({ 
        job: { $in: await Job.find({ recruiter: recruiter._id }).distinct('_id') }
      });
      
      return {
        ...recruiter.toObject(),
        statistics: {
          jobsPosted: jobsCount,
          totalApplications: applicationsCount
        }
      };
    }));
    
    res.json({
      success: true,
      data: {
        recruiters: recruitersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecruiters,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recruiters',
      error: error.message
    });
  }
}));

router.put('/recruiters/:recruiterId/verify', asyncHandler(async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { verified, reason, notes } = req.body;

    // Validate input
    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'verified field is required and must be a boolean'
      });
    }

    // Find recruiter
    const recruiter = await User.findOne({ _id: recruiterId, role: 'recruiter' });
    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: 'Recruiter not found'
      });
    }

    // Update verification status
    recruiter.isVerified = verified;
    recruiter.verificationDate = new Date();
    recruiter.verifiedBy = req.user._id; // Admin who verified
    if (reason) {
      recruiter.verificationReason = reason;
    }
    if (notes) {
      recruiter.verificationNotes = notes;
    }

    await recruiter.save();

    res.json({
      success: true,
      message: `Recruiter ${verified ? 'verified' : 'unverified'} successfully`,
      data: {
        recruiterId: recruiter._id,
        email: recruiter.email,
        companyName: recruiter.company?.name || 'Not specified',
        isVerified: recruiter.isVerified,
        verificationDate: recruiter.verificationDate,
        verifiedBy: recruiter.verifiedBy,
        verificationReason: recruiter.verificationReason,
        verificationNotes: recruiter.verificationNotes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update recruiter verification status',
      error: error.message
    });
  }
}));

router.get('/jobs', asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      location, 
      recruiterId,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status && ['open', 'closed'].includes(status)) {
      filter.status = status;
    }
    
    if (recruiterId) {
      filter.recruiter = recruiterId;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get jobs with pagination
    const Job = require('../models/Job');
    const jobs = await Job.find(filter)
      .populate('recruiter', 'firstName lastName email company.name company.website')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');
    
    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));
    
    // Get application counts for each job
    const Application = require('../models/Application');
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
      ...job.toObject(),
      applicationsCount: applicationCountMap[job._id.toString()] || 0
    }));
    
    res.json({
      success: true,
      data: {
        jobs: jobsWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalJobs,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
}));

router.put('/jobs/:jobId/status', asyncHandler(async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, reason } = req.body;

    // Validate status
    const validStatuses = ['open', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (open, closed)'
      });
    }

    // Find job
    const Job = require('../models/Job');
    const job = await Job.findById(jobId).populate('recruiter', 'firstName lastName email company.name');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Update job status
    const previousStatus = job.status;
    job.status = status;
    job.statusChangedAt = new Date();
    job.statusChangedBy = req.user._id; // Admin who changed the status
    if (reason) {
      job.statusChangeReason = reason;
    }

    await job.save();

    res.json({
      success: true,
      message: `Job status updated from ${previousStatus} to ${status}`,
      data: {
        jobId: job._id,
        title: job.title,
        recruiter: job.recruiter,
        previousStatus,
        newStatus: job.status,
        statusChangedAt: job.statusChangedAt,
        statusChangedBy: job.statusChangedBy,
        statusChangeReason: job.statusChangeReason
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update job status',
      error: error.message
    });
  }
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const SavedJob = require('../models/SavedJob');

    // Get basic counts
    const totalUsers = await User.countDocuments();
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalSavedJobs = await SavedJob.countDocuments();

    // Get active users (logged in within the period)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: startDate }
    });

    // Get new registrations in period
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    const newRecruiters = await User.countDocuments({
      role: 'recruiter',
      createdAt: { $gte: startDate }
    });

    // Get jobs created in period
    const newJobs = await Job.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get applications in period
    const newApplications = await Application.countDocuments({
      appliedAt: { $gte: startDate }
    });

    // Get job status distribution
    const jobStatusDistribution = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get application status distribution
    const applicationStatusDistribution = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get recruiter verification status
    const recruiterVerificationStatus = await User.aggregate([
      { $match: { role: 'recruiter' } },
      { $group: { _id: '$isVerified', count: { $sum: 1 } } }
    ]);

    // Get top skills from jobs
    const topSkills = await Job.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top locations from jobs
    const topLocations = await Job.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get daily registrations for the period (for charts)
    const dailyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get daily job postings for the period
    const dailyJobPostings = await Job.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get daily applications for the period
    const dailyApplications = await Application.aggregate([
      { $match: { appliedAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' },
            day: { $dayOfMonth: '$appliedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousPeriodUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    const previousPeriodJobs = await Job.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    });
    const previousPeriodApplications = await Application.countDocuments({
      appliedAt: { $gte: previousPeriodStart, $lt: startDate }
    });

    const userGrowthRate = previousPeriodUsers > 0 
      ? ((newUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(2)
      : 0;
    
    const jobGrowthRate = previousPeriodJobs > 0 
      ? ((newJobs - previousPeriodJobs) / previousPeriodJobs * 100).toFixed(2)
      : 0;
    
    const applicationGrowthRate = previousPeriodApplications > 0 
      ? ((newApplications - previousPeriodApplications) / previousPeriodApplications * 100).toFixed(2)
      : 0;

    const analytics = {
      period,
      dateRange: {
        start: startDate,
        end: now
      },
      overview: {
        totalUsers,
        totalRecruiters,
        totalJobs,
        totalApplications,
        totalSavedJobs,
        activeUsers,
        newUsers,
        newRecruiters,
        newJobs,
        newApplications
      },
      distributions: {
        jobStatus: jobStatusDistribution,
        applicationStatus: applicationStatusDistribution,
        userRoles: userRoleDistribution,
        recruiterVerification: recruiterVerificationStatus
      },
      trends: {
        topSkills,
        topLocations,
        dailyRegistrations,
        dailyJobPostings,
        dailyApplications
      },
      growthRates: {
        users: userGrowthRate,
        jobs: jobGrowthRate,
        applications: applicationGrowthRate
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
}));

router.get('/reports', asyncHandler(async (req, res) => {
  try {
    const { 
      type = 'summary', 
      format = 'json', 
      startDate, 
      endDate,
      recruiterId,
      jobId 
    } = req.query;

    // Set default date range if not provided
    const now = new Date();
    const defaultStartDate = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate ? new Date(endDate) : now;

    const Job = require('../models/Job');
    const Application = require('../models/Application');
    const SavedJob = require('../models/SavedJob');

    let reportData = {};

    switch (type) {
      case 'summary':
        reportData = await generateSummaryReport(defaultStartDate, defaultEndDate);
        break;
      case 'users':
        reportData = await generateUsersReport(defaultStartDate, defaultEndDate);
        break;
      case 'recruiters':
        reportData = await generateRecruitersReport(defaultStartDate, defaultEndDate, recruiterId);
        break;
      case 'jobs':
        reportData = await generateJobsReport(defaultStartDate, defaultEndDate, recruiterId);
        break;
      case 'applications':
        reportData = await generateApplicationsReport(defaultStartDate, defaultEndDate, jobId);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(defaultStartDate, defaultEndDate);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Valid types: summary, users, recruiters, jobs, applications, performance'
        });
    }

    // Add metadata
    reportData.metadata = {
      generatedAt: new Date(),
      generatedBy: req.user._id,
      reportType: type,
      dateRange: {
        start: defaultStartDate,
        end: defaultEndDate
      },
      filters: {
        recruiterId: recruiterId || null,
        jobId: jobId || null
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
}));

// Helper functions for different report types
async function generateSummaryReport(startDate, endDate) {
  const Job = require('../models/Job');
  const Application = require('../models/Application');
  const SavedJob = require('../models/SavedJob');

  const totalUsers = await User.countDocuments();
  const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  const totalSavedJobs = await SavedJob.countDocuments();

  const newUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const newJobs = await Job.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const newApplications = await Application.countDocuments({
    appliedAt: { $gte: startDate, $lte: endDate }
  });

  const activeUsers = await User.countDocuments({
    lastLogin: { $gte: startDate }
  });

  return {
    summary: {
      totalUsers,
      totalRecruiters,
      totalJobs,
      totalApplications,
      totalSavedJobs,
      activeUsers
    },
    periodStats: {
      newUsers,
      newJobs,
      newApplications
    }
  };
}

async function generateUsersReport(startDate, endDate) {
  const users = await User.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
  .select('-password -embeddings')
  .populate('company', 'name website')
  .sort({ createdAt: -1 });

  const userStats = await User.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        avgProfileCompletion: { $avg: '$profileCompletion' }
      }
    }
  ]);

  return {
    users,
    statistics: userStats,
    totalCount: users.length
  };
}

async function generateRecruitersReport(startDate, endDate, recruiterId) {
  const filter = { 
    role: 'recruiter',
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (recruiterId) {
    filter._id = recruiterId;
  }

  const recruiters = await User.find(filter)
    .select('-password -embeddings')
    .populate('company', 'name website description')
    .sort({ createdAt: -1 });

  const recruiterStats = await Promise.all(recruiters.map(async (recruiter) => {
    const Job = require('../models/Job');
    const Application = require('../models/Application');
    
    const jobsCount = await Job.countDocuments({ recruiter: recruiter._id });
    const applicationsCount = await Application.countDocuments({
      job: { $in: await Job.find({ recruiter: recruiter._id }).distinct('_id') }
    });

    return {
      ...recruiter.toObject(),
      statistics: {
        jobsPosted: jobsCount,
        totalApplications: applicationsCount
      }
    };
  }));

  return {
    recruiters: recruiterStats,
    totalCount: recruiters.length
  };
}

async function generateJobsReport(startDate, endDate, recruiterId) {
  const Job = require('../models/Job');
  const Application = require('../models/Application');

  const filter = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (recruiterId) {
    filter.recruiter = recruiterId;
  }

  const jobs = await Job.find(filter)
    .populate('recruiter', 'firstName lastName email company.name')
    .sort({ createdAt: -1 });

  const jobsWithStats = await Promise.all(jobs.map(async (job) => {
    const applicationsCount = await Application.countDocuments({ job: job._id });
    const applicationsByStatus = await Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return {
      ...job.toObject(),
      applicationsCount,
      applicationsByStatus
    };
  }));

  const jobStats = await Job.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgSalaryMin: { $avg: '$salaryRange.min' },
        avgSalaryMax: { $avg: '$salaryRange.max' }
      }
    }
  ]);

  return {
    jobs: jobsWithStats,
    statistics: jobStats,
    totalCount: jobs.length
  };
}

async function generateApplicationsReport(startDate, endDate, jobId) {
  const Application = require('../models/Application');
  const Job = require('../models/Job');

  const filter = {
    appliedAt: { $gte: startDate, $lte: endDate }
  };
  
  if (jobId) {
    filter.job = jobId;
  }

  const applications = await Application.find(filter)
    .populate('user', 'firstName lastName email currentPosition')
    .populate('job', 'title location recruiter')
    .populate('job.recruiter', 'firstName lastName company.name')
    .sort({ appliedAt: -1 });

  const applicationStats = await Application.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgMatchScore: { $avg: '$matchScore' }
      }
    }
  ]);

  return {
    applications,
    statistics: applicationStats,
    totalCount: applications.length
  };
}

async function generatePerformanceReport(startDate, endDate) {
  const Job = require('../models/Job');
  const Application = require('../models/Application');

  // Top performing jobs (by application count)
  const topJobs = await Job.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'job',
        as: 'applications'
      }
    },
    {
      $addFields: {
        applicationCount: { $size: '$applications' }
      }
    },
    { $sort: { applicationCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: 'recruiter',
        foreignField: '_id',
        as: 'recruiter'
      }
    },
    { $unwind: '$recruiter' }
  ]);

  // Top recruiters (by job postings and applications)
  const topRecruiters = await User.aggregate([
    { $match: { role: 'recruiter' } },
    {
      $lookup: {
        from: 'jobs',
        localField: '_id',
        foreignField: 'recruiter',
        as: 'jobs'
      }
    },
    {
      $lookup: {
        from: 'applications',
        localField: 'jobs._id',
        foreignField: 'job',
        as: 'applications'
      }
    },
    {
      $addFields: {
        jobsCount: { $size: '$jobs' },
        applicationsCount: { $size: '$applications' }
      }
    },
    { $sort: { applicationsCount: -1 } },
    { $limit: 10 }
  ]);

  // Application conversion rates
  const conversionRates = await Application.aggregate([
    { $match: { appliedAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalApplications = conversionRates.reduce((sum, item) => sum + item.count, 0);
  const hiredCount = conversionRates.find(item => item._id === 'hired')?.count || 0;
  const conversionRate = totalApplications > 0 ? (hiredCount / totalApplications * 100).toFixed(2) : 0;

  return {
    topJobs,
    topRecruiters,
    conversionRates,
    overallConversionRate: conversionRate,
    totalApplications
  };
}

module.exports = router;
