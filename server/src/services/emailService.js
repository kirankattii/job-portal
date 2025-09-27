const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email Service using Brevo SMTP
 * Configured for sending OTP emails and other notifications
 */

// Create nodemailer transporter - try Gmail first, then Brevo
const createTransporter = () => {
  // Try Gmail SMTP first (more reliable for Gmail delivery)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Fallback to Brevo SMTP
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
    throw new Error('EMAIL_USER/EMAIL_PASS or BREVO_SMTP_USER/BREVO_SMTP_PASS environment variables are required');
  }

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS
    }
  });
};

/**
 * Send OTP email for registration/verification
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} purpose - Purpose of OTP (registration, password_reset)
 */
const sendOtpEmail = async (email, otp, purpose = 'registration') => {
  try {
    const transporter = createTransporter();
    
    const subject = purpose === 'registration' 
      ? 'Verify Your Email - Job Portal Registration'
      : 'Reset Your Password - Job Portal';

    const textContent = `
Hello,

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Job Portal Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .otp-code { background: #2563eb; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Email Verification</h1>
        </div>
        
        <p>Hello,</p>
        <p>Your verification code is:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        
        <div class="warning">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and do not share this code with anyone.
        </div>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // AMP HTML for interactive email clients
    const ampContent = `
<!DOCTYPE html>
<html ⚡4email>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <style amp4email-boilerplate>body{visibility:hidden}</style>
    <style amp-custom>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .otp-code { background: #2563eb; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .verify-button { background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Email Verification</h1>
        </div>
        
        <p>Hello,</p>
        <p>Your verification code is:</p>
        
        <div class="otp-code">${otp}</div>
        
        <p>This code will expire in <strong>10 minutes</strong>.</p>
        
        <div class="warning">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email and do not share this code with anyone.
        </div>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <!-- For AMP Email to render for all recipients you must register/whitelist sender with Gmail/Yahoo etc — see docs: https://developers.google.com/gmail/ampemail/register-sender -->
        </div>
    </div>
</body>
</html>
    `.trim();

    const fromEmail = process.env.EMAIL_USER || process.env.BREVO_SMTP_USER;
    const mailOptions = {
      from: `"Job Portal" <${fromEmail}>`,
      to: email,
      subject: subject,
      text: textContent,
      html: htmlContent,
      alternatives: [
        {
          contentType: 'text/x-amp-html',
          content: ampContent
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent successfully to ${email}. MessageId: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send application confirmation email
 * @param {Object} user - User object
 * @param {Object} job - Job object
 */
const sendApplicationConfirmation = async (user, job) => {
  try {
    const transporter = createTransporter();
    
    const subject = `Application Confirmation - ${job.title} at ${job.company}`;
    
    const skillsList = job.requiredSkills && job.requiredSkills.length > 0 
      ? job.requiredSkills.join(', ') 
      : 'Not specified';
    
    const experienceRange = job.experienceMin !== undefined && job.experienceMax !== undefined
      ? `${job.experienceMin} - ${job.experienceMax} years`
      : 'Not specified';
    
    const salaryRange = job.salaryRange && job.salaryRange.min && job.salaryRange.max
      ? `$${job.salaryRange.min.toLocaleString()} - $${job.salaryRange.max.toLocaleString()}`
      : 'Not specified';

    const textContent = `
Hello ${user.firstName},

Thank you for applying to the position "${job.title}" at ${job.company}.

Your application has been received and is being reviewed by our team. We will get back to you within 3-5 business days.

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location}${job.remote ? ' (Remote)' : ''}
- Experience Required: ${experienceRange}
- Salary Range: ${salaryRange}
- Required Skills: ${skillsList}
- Application Date: ${new Date().toLocaleDateString()}

Best regards,
Job Portal Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .job-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .skills { background: #f3f4f6; padding: 10px; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Application Confirmation</h1>
        </div>
        
        <p>Hello ${user.firstName},</p>
        
        <p>Thank you for applying to the position <strong>"${job.title}"</strong> at <strong>${job.company}</strong>.</p>
        
        <p>Your application has been received and is being reviewed by our team. We will get back to you within 3-5 business days.</p>
        
        <div class="job-details">
            <h3>Job Details:</h3>
            <ul>
                <li><strong>Position:</strong> ${job.title}</li>
                <li><strong>Company:</strong> ${job.company}</li>
                <li><strong>Location:</strong> ${job.location}${job.remote ? ' (Remote)' : ''}</li>
                <li><strong>Experience Required:</strong> ${experienceRange}</li>
                <li><strong>Salary Range:</strong> ${salaryRange}</li>
                <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <div class="skills">
                <strong>Required Skills:</strong><br>
                ${skillsList}
            </div>
        </div>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: `"Job Portal" <${process.env.BREVO_SMTP_USER}>`,
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Application confirmation email sent to ${user.email}. MessageId: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send application confirmation email:', error);
    throw new Error('Failed to send application confirmation email');
  }
};

/**
 * Send recommendation email
 * @param {Object} user - User object
 * @param {Object} job - Job object
 */
const sendRecommendationEmail = async (user, job) => {
  try {
    const transporter = createTransporter();
    
    const subject = `Job Recommendation - ${job.title} at ${job.company}`;
    
    const textContent = `
Hello ${user.firstName},

We found a job that matches your profile!

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Experience Required: ${job.experienceLevel || 'Not specified'}

Click here to apply: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job._id}

Best regards,
Job Portal Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Recommendation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .job-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .apply-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Job Recommendation</h1>
        </div>
        
        <p>Hello ${user.firstName},</p>
        
        <p>We found a job that matches your profile!</p>
        
        <div class="job-card">
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Experience Required:</strong> ${job.experienceLevel || 'Not specified'}</p>
            <p><strong>Description:</strong> ${job.description ? job.description.substring(0, 200) + '...' : 'No description available'}</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job._id}" class="apply-button">Apply Now</a>
        </div>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: `"Job Portal" <${process.env.BREVO_SMTP_USER}>`,
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Recommendation email sent to ${user.email}. MessageId: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send recommendation email:', error);
    throw new Error('Failed to send recommendation email');
  }
};

/**
 * Send interactive profile completion email
 * @param {Object} user - User object
 * @param {string} updateToken - Token for profile update
 */
const sendInteractiveProfileCompletionEmail = async (user, updateToken) => {
  try {
    const transporter = createTransporter();
    
    const subject = 'Complete Your Profile - Interactive Update';
    const updateUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/profile/update/${updateToken}`;
    
    const textContent = `
Hello ${user.firstName},

Your profile is incomplete and needs to be updated to help recruiters find you better.

Current profile completion: ${user.profileCompletion || 0}%

Please complete your profile by visiting: ${updateUrl}

Best regards,
Job Portal Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Profile</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 20px 0; }
        .progress-fill { background: #2563eb; height: 100%; border-radius: 10px; width: ${user.profileCompletion || 0}%; }
        .update-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .form-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; }
        .form-textarea { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; min-height: 80px; box-sizing: border-box; }
        .save-button { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
        .quick-update { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .quick-links { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
        .quick-link { background: #0ea5e9; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Complete Your Profile</h1>
        </div>
        
        <p>Hello ${user.firstName},</p>
        
        <p>Your profile is incomplete and needs to be updated to help recruiters find you better.</p>
        
        <div>
            <p><strong>Your current profile completion:</strong></p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>${user.profileCompletion || 0}% Complete</p>
        </div>
        
        <div class="highlight">
            <strong>What's missing?</strong><br>
            • Skills and experience<br>
            • Resume upload<br>
            • Professional details<br>
            • Education information
        </div>
        
        <!-- Interactive Profile Form -->
        <div class="form-section">
            <h3>📝 Update Your Profile</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                <strong>Note:</strong> Due to email client security restrictions, forms in emails may not work. 
                Please use the quick update links below or click "Complete Your Profile" button.
            </p>
            
            <!-- Quick Update Buttons -->
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 10px; color: #2563eb;">🚀 Quick Updates (Recommended):</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                    <a href="${updateUrl}?skills=JavaScript,React,Node.js&experienceYears=3&currentPosition=Software Engineer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote" 
                       style="background: #10b981; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
                        Frontend Developer
                    </a>
                    <a href="${updateUrl}?skills=Python,Django,PostgreSQL&experienceYears=4&currentPosition=Backend Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote" 
                       style="background: #3b82f6; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
                        Backend Developer
                    </a>
                    <a href="${updateUrl}?skills=JavaScript,React,Node.js,Python&experienceYears=5&currentPosition=Full Stack Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote" 
                       style="background: #8b5cf6; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
                        Full Stack Developer
                    </a>
                    <a href="${updateUrl}?skills=Java,Spring Boot,Microservices&experienceYears=6&currentPosition=Senior Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote" 
                       style="background: #f59e0b; color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; display: inline-block;">
                        Senior Developer
                    </a>
                </div>
            </div>
            
            <!-- Manual Form (for email clients that support it) -->
            <div style="border: 2px dashed #d1d5db; padding: 20px; border-radius: 8px; background: #f9fafb;">
                <h4 style="margin-bottom: 15px; color: #374151;">📝 Manual Form (if supported by your email client):</h4>
                <form method="post" action="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/users/profile/update-from-email" target="_blank" style="margin: 0;">
                    <input type="hidden" name="token" value="${updateToken}" />
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Skills (comma-separated)</label>
                        <input type="text" name="skills" placeholder="JavaScript, React, Node.js" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Years of Experience</label>
                        <input type="number" name="experienceYears" placeholder="5" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Current Position</label>
                        <input type="text" name="currentPosition" placeholder="Software Engineer" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Current Company</label>
                        <input type="text" name="currentCompany" placeholder="Tech Corp" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Current Location</label>
                        <input type="text" name="currentLocation" placeholder="Mumbai, India" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Preferred Location</label>
                        <input type="text" name="preferredLocation" placeholder="Remote, Bangalore, Pune" 
                               style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #374151;">Bio/Summary</label>
                        <textarea name="bio" placeholder="Brief description of your professional background..." 
                                  style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; min-height: 80px; box-sizing: border-box; resize: vertical;"></textarea>
                    </div>
                    
                    <button type="submit" 
                            style="background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%;">
                        💾 Save Profile Updates
                    </button>
                </form>
            </div>
        </div>
        
        
        <a href="${updateUrl}" class="update-button">📄 Complete Your Profile</a>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>If the form doesn't work, click the "Complete Your Profile" button above.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    // AMP HTML for interactive email clients
    const ampContent = `
<!DOCTYPE html>
<html ⚡4email>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Profile</title>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <style amp4email-boilerplate>body{visibility:hidden}</style>
    <style amp-custom>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 20px 0; }
        .progress-fill { background: #2563eb; height: 100%; border-radius: 10px; width: ${user.profileCompletion || 0}%; }
        .update-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .form-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .form-group { margin-bottom: 15px; }
        .form-label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
        .form-textarea { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; min-height: 80px; }
        .save-button { background: #10b981; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Complete Your Profile</h1>
        </div>
        
        <p>Hello ${user.firstName},</p>
        
        <p>Your profile is incomplete and needs to be updated to help recruiters find you better.</p>
        
        <div>
            <p><strong>Your current profile completion:</strong></p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>${user.profileCompletion || 0}% Complete</p>
        </div>
        
        <div class="highlight">
            <strong>What's missing?</strong><br>
            • Skills and experience<br>
            • Resume upload<br>
            • Professional details<br>
            • Education information
        </div>
        
        <!-- Interactive Profile Form -->
        <div class="form-section">
            <h3>Update Your Profile</h3>
            <form method="post" action-xhr="${process.env.BACKEND_URL || 'http://localhost:5000'}/api/profile/update-from-email" target="_top">
                <input type="hidden" name="token" value="${updateToken}" />
                
                <div class="form-group">
                    <label class="form-label" for="skills">Skills (comma-separated)</label>
                    <input type="text" class="form-input" id="skills" name="skills" placeholder="JavaScript, React, Node.js" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="experience">Years of Experience</label>
                    <input type="number" class="form-input" id="experience" name="experienceYears" placeholder="5" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="currentPosition">Current Position</label>
                    <input type="text" class="form-input" id="currentPosition" name="currentPosition" placeholder="Software Engineer" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="currentCompany">Current Company</label>
                    <input type="text" class="form-input" id="currentCompany" name="currentCompany" placeholder="Tech Corp" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="currentLocation">Current Location</label>
                    <input type="text" class="form-input" id="currentLocation" name="currentLocation" placeholder="San Francisco, CA" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="preferredLocation">Preferred Location</label>
                    <input type="text" class="form-input" id="preferredLocation" name="preferredLocation" placeholder="Remote, New York, CA" />
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="bio">Bio/Summary</label>
                    <textarea class="form-textarea" id="bio" name="bio" placeholder="Brief description of your professional background..."></textarea>
                </div>
                
                <button type="submit" class="save-button">Save Profile Updates</button>
            </form>
        </div>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const fromEmail = process.env.EMAIL_USER || process.env.BREVO_SMTP_USER;
    const mailOptions = {
      from: `"Job Portal" <${fromEmail}>`,
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
      alternatives: [
        {
          contentType: 'text/x-amp-html',
          content: ampContent
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Interactive profile completion email sent to ${user.email}. MessageId: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send interactive profile completion email:', error);
    throw new Error('Failed to send interactive profile completion email');
  }
};

/**
 * Send weekly profile reminder email
 * @param {Object} user - User object
 * @param {string|{link:string, amp?:string}} linkOrAmp - Profile update link or object with AMP content
 *
 * Note: For AMP to render, sender must be registered/whitelisted with providers (Gmail/Yahoo/Mail.ru),
 * and domain must have valid SPF/DKIM/DMARC. Other clients will fall back to text/html.
 */
const sendWeeklyProfileReminder = async (user, linkOrAmp) => {
  try {
    const transporter = createTransporter();
    
    const subject = 'Weekly Profile Update Reminder';
    const link = typeof linkOrAmp === 'string' ? linkOrAmp : (linkOrAmp?.link || '#');
    const ampAlt = typeof linkOrAmp === 'object' && linkOrAmp?.amp ? String(linkOrAmp.amp) : null;
    
    const textContent = `
Hello ${user.firstName},

It's been a week since you last updated your profile. Keeping your profile up-to-date helps recruiters find you!

Your current profile completion: ${user.profileCompletion || 0}%

Update your profile: ${link}

Best regards,
Job Portal Team
    `.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile Update Reminder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .container { background: #f9f9f9; padding: 30px; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; margin: 20px 0; }
        .progress-fill { background: #2563eb; height: 100%; border-radius: 10px; width: ${user.profileCompletion || 0}%; }
        .update-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Job Portal</div>
            <h1>Profile Update Reminder</h1>
        </div>
        
        <p>Hello ${user.firstName},</p>
        
        <p>It's been a week since you last updated your profile. Keeping your profile up-to-date helps recruiters find you!</p>
        
        <div>
            <p><strong>Your current profile completion:</strong></p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <p>${user.profileCompletion || 0}% Complete</p>
        </div>
        
        <a href="${link}" class="update-button">Update Your Profile</a>
        
        <p>Best regards,<br>Job Portal Team</p>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const mailOptions = {
      from: `"Job Portal" <${process.env.BREVO_SMTP_USER}>`,
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
      alternatives: ampAlt ? [{ contentType: 'text/x-amp-html', content: ampAlt }] : undefined
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Weekly reminder email sent to ${user.email}. MessageId: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    logger.error('Failed to send weekly reminder email:', error);
    throw new Error('Failed to send weekly reminder email');
  }
};

module.exports = {
  sendOtpEmail,
  sendApplicationConfirmation,
  sendRecommendationEmail,
  sendInteractiveProfileCompletionEmail,
  sendWeeklyProfileReminder
};

