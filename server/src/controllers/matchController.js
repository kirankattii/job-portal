const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { computeMatchScore, buildProfileText, computeAtsScoreFromResume } = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * POST /api/ai/match-job/:jobId
 * Compute matches for all users (or top N) for a given job.
 * Body: { topN?: number }
 */
async function matchJobForAllUsers(req, res, next) {
  try {
    const { jobId } = req.params;
    const topN = Number(req.body?.topN) > 0 ? Number(req.body.topN) : 20;

    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Fetch active users with public/recruiter-only visibility
    const users = await User.find({ isActive: true }).lean();

    const scored = [];
    for (const user of users) {
      try {
        const result = await computeMatchScore(job, user);
        scored.push({ userId: user._id, score: result.score, details: result, user });
      } catch (err) {
        logger.error(`Failed scoring user ${user?._id}: ${err.message}`);
      }
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topN).map(item => ({
      userId: item.userId,
      score: item.score,
      matchedSkills: item.details.matchedSkills,
      missingSkills: item.details.missingSkills
    }));

    return res.json({ success: true, total: scored.length, topN: topN, results: top });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/recruiter/job/:jobId/applicants
 * Return applicants with matchScore; compute if missing.
 */
async function getApplicantsWithMatchScore(req, res, next) {
  try {
    const { jobId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const sortField = req.query.sortBy || 'matchScore';
    const sortOrder = (req.query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Pull applications; we will sort in-memory after recomputation
    const applications = await Application.find({ job: jobId })
      .populate('user')
      .lean();

    const enriched = [];
    for (const app of applications) {
      let matchScore = app.matchScore || 0;
      let matchedDetails = app?.matchedDetails || {};
      let matchedSkills = matchedDetails?.matchedSkills || [];
      let missingSkills = matchedDetails?.missingSkills || [];

      if (!matchScore || matchScore === 0) {
        try {
          const resumeUrl = app.resumeUrl || app.user?.resumeUrl || '';
          if (resumeUrl) {
            const ats = await computeAtsScoreFromResume(job, resumeUrl);
            matchScore = ats.score;
            matchedDetails = {
              skillsMatch: ats.score,
              experienceMatch: matchedDetails.experienceMatch ?? 0,
              locationMatch: matchedDetails.locationMatch ?? 0,
              salaryMatch: matchedDetails.salaryMatch ?? 0,
              matchedSkills: matchedDetails.matchedSkills || [],
              missingSkills: matchedDetails.missingSkills || [],
              notes: 'ATS score computed via Gemini'
            };
          } else {
            const result = await computeMatchScore(job, app.user);
            matchScore = result.score;
            matchedDetails = {
              skillsMatch: result.skillsMatch ?? matchedDetails.skillsMatch ?? 0,
              experienceMatch: result.experienceMatch ?? matchedDetails.experienceMatch ?? 0,
              locationMatch: result.locationMatch ?? matchedDetails.locationMatch ?? 0,
              salaryMatch: result.salaryMatch ?? matchedDetails.salaryMatch ?? 0,
              matchedSkills: result.matchedSkills || [],
              missingSkills: result.missingSkills || [],
              notes: result.notes || matchedDetails.notes || ''
            };
            matchedSkills = matchedDetails.matchedSkills;
            missingSkills = matchedDetails.missingSkills;
          }
        } catch (err) {
          logger.error(`Failed scoring application ${app._id}: ${err.message}`);
        }
      }

      enriched.push({
        applicationId: app._id,
        userId: app.user?._id,
        userName: app.user?.fullName || [app.user?.firstName, app.user?.lastName].filter(Boolean).join(' '),
        matchScore,
        matchedDetails,
        matchedSkills,
        missingSkills,
        status: app.status,
        appliedAt: app.appliedAt
      });
    }

    // Sort
    enriched.sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (aVal < bVal) return 1 * -sortOrder;
      if (aVal > bVal) return -1 * -sortOrder;
      return 0;
    });

    const total = enriched.length;
    const paged = enriched.slice(skip, skip + limit);

    return res.json({
      success: true,
      total,
      page,
      limit,
      sortBy: sortField,
      order: sortOrder === 1 ? 'asc' : 'desc',
      applicants: paged
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  matchJobForAllUsers,
  getApplicantsWithMatchScore
};


