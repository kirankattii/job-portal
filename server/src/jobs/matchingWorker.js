const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { computeMatchScore, computeAtsScoreFromResume } = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Iterate users in batches and compute match for a specific job.
 * For users with score >= 50, send recommendation email and record result.
 * @param {string|mongoose.Types.ObjectId} jobId
 */
async function runMatchForJob(jobId) {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      logger.warn(`matchingWorker: Job not found: ${jobId}`);
      return;
    }

    const batchSize = 100;
    const query = { role: 'user', isActive: true, 'preferences.jobAlerts': true };
    const total = await User.countDocuments(query);

    logger.info(`matchingWorker: Starting matching for job ${job._id} - total users: ${total}`);

    for (let skip = 0; skip < total; skip += batchSize) {
      const users = await User.find(query).skip(skip).limit(batchSize).lean(false);

      for (const user of users) {
        try {
          // Ensure user embeddings exist; generate and save if missing
          if (!Array.isArray(user.embeddings) || user.embeddings.length === 0) {
            try {
              await user.updateEmbeddings();
              await user.save();
            } catch (embErr) {
              logger.warn(`matchingWorker: Failed to update embeddings for user ${user._id}: ${embErr.message}`);
            }
          }

          let score = 0;
          try {
            if (user.resumeUrl) {
              const ats = await computeAtsScoreFromResume(job.toObject(), user.resumeUrl);
              score = ats.score;
            } else {
              const res = await computeMatchScore(job.toObject(), user.toObject());
              score = res.score;
            }
          } catch (_) {
            const res = await computeMatchScore(job.toObject(), user.toObject());
            score = res.score;
          }

          if (score >= 50) {
            // Upsert an application-like record to store recommendation with match score
            // If Application unique index prevents duplicate (job,user), use findOneAndUpdate
            await Application.findOneAndUpdate(
              { job: job._id, user: user._id },
              {
                job: job._id,
                user: user._id,
                resumeUrl: user.resumeUrl || 'system:recommendation',
                status: 'applied',
                matchScore: score,
                matchedDetails: {
                  skillsMatch: score,
                  experienceMatch: 0,
                  locationMatch: 0,
                  salaryMatch: 0,
                  notes: 'ATS auto-match score'
                },
                appliedAt: new Date()
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            try {
              await emailService.sendRecommendationEmail(user, job);
            } catch (mailErr) {
              logger.warn(`matchingWorker: Email send failed for user ${user._id} job ${job._id}: ${mailErr.message}`);
            }
          }
        } catch (err) {
          logger.error(`matchingWorker: Error processing user ${user._id} for job ${job._id}: ${err.message}`);
        }
      }
    }

    logger.info(`matchingWorker: Completed matching for job ${job._id}`);
  } catch (err) {
    logger.error('matchingWorker: runMatchForJob failed:', err);
  }
}

module.exports = { runMatchForJob };
