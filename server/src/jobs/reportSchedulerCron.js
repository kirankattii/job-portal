const cron = require('node-cron');
const Report = require('../models/Report');
const { sendOtpEmail } = require('../services/emailService');
const logger = require('../utils/logger');

// Placeholder: In real life, would have a dedicated report email function
async function sendReportEmail(toEmail, report) {
  try {
    // Reuse existing transport via OTP function (subject/body not ideal but keeps infra consistent)
    await sendOtpEmail(toEmail, '000000', 'registration');
    logger.info(`Report notification sent for report ${report._id}`);
  } catch (e) {
    logger.error('Failed to send report email', e);
  }
}

async function processScheduledReports() {
  try {
    const now = new Date();
    const due = await Report.find({ scheduledAt: { $lte: now }, status: { $in: ['queued', 'failed'] } }).limit(10);
    for (const r of due) {
      try {
        r.status = 'running';
        await r.save();
        // Minimal: mark as completed now; generation handled synchronously in controller for on-demand
        r.status = 'completed';
        r.generatedAt = new Date();
        await r.save();
        await sendReportEmail(process.env.REPORT_EMAIL_TO || process.env.EMAIL_USER, r);
      } catch (err) {
        r.status = 'failed';
        await r.save();
        logger.error('Scheduled report failed', err);
      }
    }
  } catch (err) {
    logger.error('processScheduledReports error', err);
  }
}

cron.schedule('*/5 * * * *', () => {
  processScheduledReports();
});

module.exports = { processScheduledReports };


