const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Daily cron at 02:00 UTC to send weekly reminders to users whose
 * profile is stale (>7 days) or whose completion is < 80.
 *
 * Note: Ensure this module is imported during server startup to schedule the job.
 */

function buildSecurePrefillLink(userId) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const token = jwt.sign(
    { id: userId.toString(), purpose: 'profile_prefill' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  return `${baseUrl}/profile?prefill=${encodeURIComponent(token)}`;
}

function buildAmpFormHtml(user) {
  const apiBase = process.env.API_BASE_URL || process.env.BACKEND_URL || process.env.SERVER_URL || '';
  const actionUrl = `${apiBase}/api/email/amp-profile-update`;
  // Minimal amp-form allowing the user to quickly submit two fields
  // AMP rendering requires sender domain to be registered with mailbox providers.
  return `
<!DOCTYPE html>
<html ⚡4email>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
  <style amp4email-boilerplate>body{visibility:hidden}</style>
  <style amp-custom>
    body{font-family:Arial,sans-serif;color:#333;max-width:600px;margin:0 auto;padding:20px}
    .container{background:#f9f9f9;padding:24px;border-radius:10px}
    .label{display:block;margin:12px 0 6px;font-weight:bold}
    .input{width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:6px}
    .button{margin-top:16px;background:#2563eb;color:#fff;border:none;padding:12px 16px;border-radius:6px}
  </style>
  <!-- AMP Email rendering requires sender/domain registration and proper SPF/DKIM/DMARC. -->
  <!-- Non-AMP clients will fall back to text/html alternative. -->
  <!-- See: https://developers.google.com/gmail/ampemail/ -->
  <!-- Ensure sender is whitelisted with Gmail/Yahoo/Mail.ru and domain has SPF/DKIM/DMARC. -->
  </head>
<body>
  <div class="container">
    <h1>Quick Profile Update</h1>
    <p>Hello ${user.firstName}, update a couple details below or use the secure link.</p>
    <form method="post" action-xhr="${actionUrl}" target="_top">
      <input type="hidden" name="email" value="${user.email}" />
      <label class="label" for="currentPosition">Current Position</label>
      <input class="input" type="text" name="currentPosition" id="currentPosition" />
      <label class="label" for="currentLocation">Current Location</label>
      <input class="input" type="text" name="currentLocation" id="currentLocation" />
      <div submit-success>
        <template type="amp-mustache">
          <p>Thanks! {{message}}</p>
        </template>
      </div>
      <div submit-error>
        <template type="amp-mustache">
          <p>Update failed: {{message}}</p>
        </template>
      </div>
      <button class="button" type="submit">Save</button>
    </form>
  </div>
</body>
</html>`;
}

async function sendRemindersBatch() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const filter = {
      role: 'user',
      isActive: true,
      'preferences.emailNotifications': true,
      $or: [
        { lastProfileUpdatedAt: { $lt: sevenDaysAgo } },
        { profileCompletion: { $lt: 80 } }
      ]
    };

    const users = await User.find(filter).limit(2000).lean(false);
    logger.info(`profileReminderCron: Found ${users.length} users to remind`);

    for (const user of users) {
      try {
        const link = buildSecurePrefillLink(user._id);
        const amp = buildAmpFormHtml(user);
        await emailService.sendWeeklyProfileReminder(user, { link, amp });
      } catch (err) {
        logger.warn(`profileReminderCron: Failed email for ${user.email}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error('profileReminderCron: sendRemindersBatch failed:', err);
  }
}

// Schedule at 02:00 UTC daily
// Cron format: min hour day-of-month month day-of-week
cron.schedule('0 2 * * *', async () => {
  // Only run when DB is connected
  if (mongoose.connection.readyState !== 1) {
    logger.warn('profileReminderCron: DB not connected; skipping run');
    return;
  }
  logger.info('profileReminderCron: Running daily weekly-reminder job');
  await sendRemindersBatch();
}, {
  scheduled: true,
  timezone: 'UTC'
});

module.exports = { sendRemindersBatch };


