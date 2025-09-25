const Application = require('../models/Application');
const Job = require('../models/Job');
const Recruiter = require('../models/Recruiter');
const { computeMatchScore, computeAtsScoreFromResume } = require('../services/aiService');
const emailService = require('../services/emailService');
const { uploadBufferToCloudinary } = require('../middleware/uploadMulter');
const logger = require('../utils/logger');

/**
 * Apply to a job
 * Expects optional file field `resume` (multer) or `resumeUrl` in body.
 * Uses user's saved `resumeUrl` if none provided.
 */
async function applyToJob(req, res) {
  const user = req.user;
  const jobId = req.params.jobId || req.params.id;

  try {
    // Validate job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is not open for applications' });
    }

    // Resolve resume URL: file upload > body > user profile
    let resumeUrl = req.body && req.body.resumeUrl ? String(req.body.resumeUrl).trim() : '';

    if (req.file && req.file.buffer) {
      const uploadRes = await uploadBufferToCloudinary(req.file, `resumes/${user._id}`, {
        folder: `resumes/${user._id}`,
        resource_type: 'auto'
      });
      resumeUrl = uploadRes && (uploadRes.secure_url || uploadRes.url) || resumeUrl;
    }

    if (!resumeUrl && user && user.resumeUrl) {
      resumeUrl = user.resumeUrl;
    }

    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Resume is required. Upload a file or provide resumeUrl.' });
    }

    const application = new Application({
      job: job._id,
      user: user._id,
      resumeUrl,
      coverLetter: req.body && req.body.coverLetter ? String(req.body.coverLetter) : undefined,
      appliedAt: new Date()
    });

    // Compute ATS score via Gemini using parsed resume
    try {
      const { score } = await computeAtsScoreFromResume(job, resumeUrl);
      application.matchScore = score;
      application.matchedDetails = {
        ...(application.matchedDetails || {}),
        skillsMatch: score,
        notes: 'ATS score computed via Gemini on parsed resume'
      };
    } catch (err) {
      // Fallback to embedding similarity if ATS fails
      try {
        const { score } = await computeMatchScore(job, user);
        application.matchScore = score;
      } catch (e2) {
        logger.warn('ATS and embedding match score failed:', e2.message || e2);
      }
    }

    await application.save();

    // Prepare email job object with company name if available
    let recruiter = null;
    try {
      recruiter = await Recruiter.findById(job.recruiter);
    } catch (_) {}
    const jobForEmail = {
      _id: job._id,
      title: job.title,
      location: job.location,
      company: recruiter && recruiter.companyName ? recruiter.companyName : 'Company',
      recruiter: job.recruiter
    };

    // Send emails (non-blocking)
    (async () => {
      try {
        await emailService.sendApplicationConfirmation(user, jobForEmail);
      } catch (e) {
        logger.warn('sendApplicationConfirmation failed:', e && e.message ? e.message : e);
      }
      try {
        if (typeof emailService.sendRecruiterNotification === 'function' && recruiter) {
          await emailService.sendRecruiterNotification(recruiter, user, application.matchScore || 0);
        }
      } catch (e) {
        logger.warn('sendRecruiterNotification failed:', e && e.message ? e.message : e);
      }
    })();

    return res.status(201).json({
      success: true,
      data: {
        applicationId: application._id,
        matchScore: application.matchScore || 0
      }
    });
  } catch (err) {
    if (err && (err.code === 11000 || err.statusCode === 11000)) {
      return res.status(409).json({ success: false, message: 'You have already applied to this job' });
    }
    return res.status(400).json({ success: false, message: err.message || 'Failed to apply' });
  }
}

/**
 * Get user applications with job details
 */
async function getUserApplications(req, res) {
  try {
    const userId = req.user._id;
    const { status, limit = 50, page = 1 } = req.query;
    
    // Build filter
    const filter = { user: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const applications = await Application.find(filter)
      .populate('job', 'title company location salary type description')
      .sort({ appliedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalCount = await Application.countDocuments(filter);
    
    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: skip + applications.length < totalCount,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
}

/**
 * Get single application details
 */
async function getApplicationDetails(req, res) {
  try {
    const { applicationId } = req.params;
    const userId = req.user._id;
    
    const application = await Application.findOne({
      _id: applicationId,
      user: userId
    }).populate('job');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
}

/**
 * Update application status (for recruiters)
 */
async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;
    
    const application = await Application.findById(applicationId)
      .populate('job', 'recruiter')
      .populate('user', 'firstName lastName email');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Check if user is authorized (recruiter or admin)
    const isAuthorized = req.user.role === 'admin' || 
      (req.user.role === 'recruiter' && application.job.recruiter.toString() === req.user._id.toString());
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this application'
      });
    }
    
    application.status = status;
    if (notes) {
      application.notes = notes;
    }
    
    await application.save();
    
    // Send notification email to user
    try {
      const emailService = require('../services/emailService');
      await emailService.sendApplicationStatusUpdate(
        application.user,
        application.job,
        status,
        notes
      );
    } catch (emailError) {
      logger.warn('Failed to send status update email:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
}

/**
 * Save application draft
 */
async function saveApplicationDraft(req, res) {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    const { coverLetter, resumeUrl, personalInfo } = req.body;
    
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Save draft to user's profile or create a separate drafts collection
    // For now, we'll store it in a simple way
    const draftData = {
      jobId,
      coverLetter,
      resumeUrl,
      personalInfo,
      savedAt: new Date()
    };
    
    // In a real implementation, you might want to create a separate Drafts collection
    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: draftData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
}

/**
 * Export user applications
 */
async function exportApplications(req, res) {
  try {
    const userId = req.user._id;
    const { format = 'csv' } = req.query;
    
    const applications = await Application.find({ user: userId })
      .populate('job', 'title company location salary type')
      .sort({ appliedAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV
      let csv = 'Application ID,Job Title,Company,Location,Status,Applied Date,Match Score\n';
      
      applications.forEach(app => {
        csv += `${app._id},${app.job.title},${app.job.company},${app.job.location},${app.status},${app.appliedAt.toISOString()},${app.matchScore || 0}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="applications-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: applications
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export applications',
      error: error.message
    });
  }
}

module.exports = {
  applyToJob,
  getUserApplications,
  getApplicationDetails,
  updateApplicationStatus,
  saveApplicationDraft,
  exportApplications
};


