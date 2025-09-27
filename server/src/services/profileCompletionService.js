const User = require('../models/User');
const ProfileUpdateToken = require('../models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./emailService');
const logger = require('../utils/logger');

/**
 * Profile Completion Service
 * Handles checking profile completion and sending interactive emails
 */

/**
 * Check if a user's profile is incomplete
 * @param {Object} user - User object
 * @param {number} threshold - Completion threshold (default: 70%)
 * @returns {boolean} - True if profile is incomplete
 */
const isProfileIncomplete = (user, threshold = 70) => {
  return (user.profileCompletion || 0) < threshold;
};

/**
 * Get missing profile fields for a user
 * @param {Object} user - User object
 * @returns {Array} - Array of missing field names
 */
const getMissingFields = (user) => {
  const requiredFields = [
    { key: 'skills', name: 'Skills', check: (val) => Array.isArray(val) && val.length > 0 },
    { key: 'experienceYears', name: 'Experience Years', check: (val) => val !== undefined && val !== null },
    { key: 'currentPosition', name: 'Current Position', check: (val) => val && val.trim().length > 0 },
    { key: 'currentCompany', name: 'Current Company', check: (val) => val && val.trim().length > 0 },
    { key: 'currentLocation', name: 'Current Location', check: (val) => val && val.trim().length > 0 },
    { key: 'preferredLocation', name: 'Preferred Location', check: (val) => val && val.trim().length > 0 },
    { key: 'bio', name: 'Bio/Summary', check: (val) => val && val.trim().length > 0 },
    { key: 'resumeUrl', name: 'Resume', check: (val) => val && val.trim().length > 0 },
    { key: 'phone', name: 'Phone Number', check: (val) => val && val.trim().length > 0 }
  ];

  return requiredFields
    .filter(field => !field.check(user[field.key]))
    .map(field => field.name);
};

/**
 * Send interactive profile completion email to a user
 * @param {Object} user - User object
 * @param {string} reason - Reason for sending the email
 * @returns {Object} - Result object
 */
const sendProfileCompletionEmail = async (user, reason = 'profile_incomplete') => {
  try {
    // Check if profile is already complete enough
    if (!isProfileIncomplete(user)) {
      return {
        success: false,
        message: 'Profile is already complete enough',
        profileCompletion: user.profileCompletion
      };
    }

    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    
    // Send interactive email
    await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);

    logger.info(`Profile completion email sent to ${user.email} (${reason})`);

    return {
      success: true,
      message: 'Profile completion email sent successfully',
      profileCompletion: user.profileCompletion,
      missingFields: getMissingFields(user),
      token: tokenDoc.token
    };
  } catch (error) {
    logger.error(`Failed to send profile completion email to ${user.email}:`, error);
    throw new Error(`Failed to send profile completion email: ${error.message}`);
  }
};

/**
 * Check and send profile completion emails to users with incomplete profiles
 * @param {Object} options - Options for the check
 * @param {number} options.threshold - Completion threshold (default: 70%)
 * @param {number} options.limit - Maximum number of users to process (default: 100)
 * @param {number} options.daysSinceLastUpdate - Only check users who haven't updated in X days (default: 7)
 * @returns {Object} - Result object with statistics
 */
const checkAndSendProfileCompletionEmails = async (options = {}) => {
  const {
    threshold = 70,
    limit = 100,
    daysSinceLastUpdate = 7
  } = options;

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastUpdate);

    // Find users with incomplete profiles who haven't updated recently
    const incompleteUsers = await User.find({
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      profileCompletion: { $lt: threshold },
      $or: [
        { lastProfileUpdatedAt: { $lt: cutoffDate } },
        { lastProfileUpdatedAt: { $exists: false } }
      ]
    })
    .limit(limit)
    .select('_id firstName lastName email profileCompletion lastProfileUpdatedAt')
    .lean();

    logger.info(`Found ${incompleteUsers.length} users with incomplete profiles`);

    const results = {
      totalChecked: incompleteUsers.length,
      emailsSent: 0,
      errors: 0,
      skipped: 0,
      details: []
    };

    // Process each user
    for (const user of incompleteUsers) {
      try {
        // Check if we already sent an email recently (within 24 hours)
        const recentToken = await ProfileUpdateToken.findOne({
          userId: user._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentToken) {
          results.skipped++;
          results.details.push({
            userId: user._id,
            email: user.email,
            status: 'skipped',
            reason: 'Email sent recently'
          });
          continue;
        }

        // Send email
        const result = await sendProfileCompletionEmail(user, 'automated_check');
        results.emailsSent++;
        results.details.push({
          userId: user._id,
          email: user.email,
          status: 'sent',
          profileCompletion: user.profileCompletion,
          missingFields: result.missingFields
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          userId: user._id,
          email: user.email,
          status: 'error',
          error: error.message
        });
        logger.error(`Error processing user ${user.email}:`, error);
      }
    }

    logger.info(`Profile completion email check completed: ${results.emailsSent} sent, ${results.errors} errors, ${results.skipped} skipped`);

    return results;
  } catch (error) {
    logger.error('Failed to check and send profile completion emails:', error);
    throw new Error(`Failed to check and send profile completion emails: ${error.message}`);
  }
};

/**
 * Clean up expired profile update tokens
 * @returns {number} - Number of tokens cleaned up
 */
const cleanupExpiredTokens = async () => {
  try {
    const deletedCount = await ProfileUpdateToken.cleanupExpired();
    logger.info(`Cleaned up ${deletedCount} expired profile update tokens`);
    return deletedCount;
  } catch (error) {
    logger.error('Failed to cleanup expired tokens:', error);
    throw new Error(`Failed to cleanup expired tokens: ${error.message}`);
  }
};

module.exports = {
  isProfileIncomplete,
  getMissingFields,
  sendProfileCompletionEmail,
  checkAndSendProfileCompletionEmails,
  cleanupExpiredTokens
};
