const cron = require('node-cron');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const User = require('../models/User');
const { computeAtsScoreFromResume } = require('../services/aiService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Runs daily at 09:00 server time
const SCHEDULE = process.env.ATS_CRON_SCHEDULE || '0 9 * * *';

async function runDailyAtsRecommendations() {
  try {
    logger.info('ATS Cron: Starting daily recommendations');

    const jobs = await Job.find({ status: 'open' }).limit(1000).lean();
    if (!jobs.length) {
      logger.info('ATS Cron: No open jobs');
      return;
    }

    // Only active users with a resume and email notifications enabled
    const usersCursor = User.find({
      isActive: true,
      resumeUrl: { $exists: true, $ne: null },
      'preferences.jobAlerts': true
    }).cursor();

    for (let user = await usersCursor.next(); user != null; user = await usersCursor.next()) {
      for (const job of jobs) {
        try {
          const { score } = await computeAtsScoreFromResume(job, user.resumeUrl);
          if (score >= 50) {
            // Prepare minimal job info for emailService template
            const jobForEmail = {
              _id: job._id,
              title: job.title,
              location: job.location,
              company: job.company || 'Company',
              description: job.description
            };
            await emailService.sendRecommendationEmail(user, jobForEmail);
            logger.info(`ATS Cron: Sent recommendation to ${user.email} for job ${job._id} (score=${score})`);
          }
        } catch (err) {
          logger.warn(`ATS Cron: Scoring failed for user ${user._id} job ${job._id}: ${err.message}`);
        }
      }
    }

    logger.info('ATS Cron: Completed daily recommendations');
  } catch (err) {
    logger.error('ATS Cron: Failed to run daily recommendations:', err);
  }
}

// Schedule the cron job
try {
  cron.schedule(SCHEDULE, runDailyAtsRecommendations, { timezone: process.env.TZ || undefined });
  logger.info(`ATS Cron: Scheduled with pattern "${SCHEDULE}"`);
} catch (err) {
  logger.error('ATS Cron: Failed to schedule job:', err);
}

module.exports = { runDailyAtsRecommendations };


