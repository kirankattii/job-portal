const cron = require('node-cron');
const { checkAndSendProfileCompletionEmails, cleanupExpiredTokens } = require('../services/profileCompletionService');
const logger = require('../utils/logger');

/**
 * Profile Completion Cron Job
 * Automatically checks for users with incomplete profiles and sends interactive emails
 */

// Run every day at 9:00 AM
const PROFILE_COMPLETION_SCHEDULE = '0 9 * * *';

// Run cleanup every Sunday at 2:00 AM
const TOKEN_CLEANUP_SCHEDULE = '0 2 * * 0';

let profileCompletionJob = null;
let tokenCleanupJob = null;

/**
 * Start the profile completion cron job
 */
const startProfileCompletionCron = () => {
  if (profileCompletionJob) {
    logger.warn('Profile completion cron job is already running');
    return;
  }

  profileCompletionJob = cron.schedule(PROFILE_COMPLETION_SCHEDULE, async () => {
    try {
      logger.info('Starting profile completion email check...');
      
      const result = await checkAndSendProfileCompletionEmails({
        threshold: 70, // 70% completion threshold
        limit: 50, // Process max 50 users per run
        daysSinceLastUpdate: 7 // Only check users who haven't updated in 7 days
      });

      logger.info('Profile completion email check completed:', {
        totalChecked: result.totalChecked,
        emailsSent: result.emailsSent,
        errors: result.errors,
        skipped: result.skipped
      });

      // Log details for monitoring
      if (result.errors > 0) {
        logger.warn('Some users had errors during profile completion email check:', 
          result.details.filter(d => d.status === 'error')
        );
      }

    } catch (error) {
      logger.error('Profile completion cron job failed:', error);
    }
  }, {
    scheduled: false,
    timezone: 'UTC'
  });

  profileCompletionJob.start();
  logger.info(`Profile completion cron job started with schedule: ${PROFILE_COMPLETION_SCHEDULE}`);
};

/**
 * Start the token cleanup cron job
 */
const startTokenCleanupCron = () => {
  if (tokenCleanupJob) {
    logger.warn('Token cleanup cron job is already running');
    return;
  }

  tokenCleanupJob = cron.schedule(TOKEN_CLEANUP_SCHEDULE, async () => {
    try {
      logger.info('Starting profile update token cleanup...');
      
      const deletedCount = await cleanupExpiredTokens();
      
      logger.info(`Profile update token cleanup completed. Deleted ${deletedCount} expired tokens.`);

    } catch (error) {
      logger.error('Token cleanup cron job failed:', error);
    }
  }, {
    scheduled: false,
    timezone: 'UTC'
  });

  tokenCleanupJob.start();
  logger.info(`Token cleanup cron job started with schedule: ${TOKEN_CLEANUP_SCHEDULE}`);
};

/**
 * Stop all cron jobs
 */
const stopAllCronJobs = () => {
  if (profileCompletionJob) {
    profileCompletionJob.stop();
    profileCompletionJob = null;
    logger.info('Profile completion cron job stopped');
  }

  if (tokenCleanupJob) {
    tokenCleanupJob.stop();
    tokenCleanupJob = null;
    logger.info('Token cleanup cron job stopped');
  }
};

/**
 * Start all cron jobs
 */
const startAllCronJobs = () => {
  startProfileCompletionCron();
  startTokenCleanupCron();
};

/**
 * Get cron job status
 */
const getCronJobStatus = () => {
  return {
    profileCompletion: {
      running: profileCompletionJob ? profileCompletionJob.running : false,
      schedule: PROFILE_COMPLETION_SCHEDULE
    },
    tokenCleanup: {
      running: tokenCleanupJob ? tokenCleanupJob.running : false,
      schedule: TOKEN_CLEANUP_SCHEDULE
    }
  };
};

/**
 * Manually trigger profile completion check (for testing)
 */
const triggerProfileCompletionCheck = async (options = {}) => {
  try {
    logger.info('Manually triggering profile completion check...');
    
    const result = await checkAndSendProfileCompletionEmails({
      threshold: options.threshold || 70,
      limit: options.limit || 50,
      daysSinceLastUpdate: options.daysSinceLastUpdate || 7
    });

    logger.info('Manual profile completion check completed:', result);
    return result;

  } catch (error) {
    logger.error('Manual profile completion check failed:', error);
    throw error;
  }
};

module.exports = {
  startProfileCompletionCron,
  startTokenCleanupCron,
  startAllCronJobs,
  stopAllCronJobs,
  getCronJobStatus,
  triggerProfileCompletionCheck
};
