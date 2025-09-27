# Interactive Profile Completion Email Feature

## Overview

This feature automatically detects users with incomplete profiles and sends them interactive emails where they can update their profile information directly from the email without needing to visit the website.

## Features

- **Automatic Detection**: Identifies users with profiles less than 70% complete
- **Interactive Email**: AMP HTML email with embedded form for profile updates
- **Secure Tokens**: Uses secure tokens for profile updates without requiring login
- **Multiple Update Methods**: Users can update via email form or visit a dedicated page
- **Automated Scheduling**: Cron job runs daily to check for incomplete profiles
- **Admin Controls**: Admin endpoints to manually trigger profile completion checks

## Architecture

### Backend Components

1. **ProfileUpdateToken Model** (`server/src/models/ProfileUpdateToken.js`)
   - Manages secure tokens for profile updates
   - Tracks token usage and expiration
   - Prevents token reuse

2. **Email Service** (`server/src/services/emailService.js`)
   - `sendInteractiveProfileCompletionEmail()` function
   - Creates HTML and AMP HTML versions of the email
   - Includes embedded form for direct profile updates

3. **Profile Completion Service** (`server/src/services/profileCompletionService.js`)
   - `checkAndSendProfileCompletionEmails()` function
   - Identifies users with incomplete profiles
   - Manages email sending logic

4. **Cron Job** (`server/src/jobs/profileCompletionCron.js`)
   - Runs daily at 9:00 AM UTC
   - Automatically checks for incomplete profiles
   - Sends emails to users who need to complete their profiles

5. **API Endpoints** (`server/src/routes/users.js`)
   - `POST /api/users/profile/update-from-email` - Handle profile updates from email
   - `POST /api/users/profile/send-completion-email` - Manually send completion email
   - `POST /api/users/profile/check-incomplete-profiles` - Admin endpoint for bulk checks

### Frontend Components

1. **Profile Update Page** (`client/src/pages/ProfileUpdate.jsx`)
   - Public page accessible via token
   - Form for updating profile information
   - Handles token validation and profile updates

2. **Routing** (`client/src/routes/index.jsx`)
   - Added route for `/profile/update/:token`

## Email Template

The interactive email includes:

- **HTML Version**: Standard email with link to profile update page
- **AMP HTML Version**: Interactive form embedded in email
- **Form Fields**:
  - Skills (comma-separated)
  - Years of Experience
  - Current Position
  - Current Company
  - Current Location
  - Preferred Location
  - Bio/Summary

## API Endpoints

### Update Profile from Email
```http
POST /api/users/profile/update-from-email
Content-Type: application/json

{
  "token": "secure_token_here",
  "skills": "JavaScript, React, Node.js",
  "experienceYears": 5,
  "currentPosition": "Software Engineer",
  "currentCompany": "Tech Corp",
  "currentLocation": "San Francisco, CA",
  "preferredLocation": "Remote",
  "bio": "Experienced developer..."
}
```

### Send Completion Email (User)
```http
POST /api/users/profile/send-completion-email
Authorization: Bearer <user_token>
```

### Check Incomplete Profiles (Admin)
```http
POST /api/users/profile/check-incomplete-profiles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "threshold": 70,
  "limit": 100,
  "daysSinceLastUpdate": 7
}
```

## Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BREVO_SMTP_USER=your-brevo-email
BREVO_SMTP_PASS=your-brevo-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Cron Job Schedule

- **Profile Completion Check**: Daily at 9:00 AM UTC
- **Token Cleanup**: Weekly on Sunday at 2:00 AM UTC

## Usage

### Automatic Operation

The system automatically:
1. Checks for users with incomplete profiles daily
2. Sends interactive emails to users who need to complete their profiles
3. Cleans up expired tokens weekly

### Manual Triggers

#### For Users
```javascript
// Send completion email to current user
const response = await fetch('/api/users/profile/send-completion-email', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### For Admins
```javascript
// Check and send emails to users with incomplete profiles
const response = await fetch('/api/users/profile/check-incomplete-profiles', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    threshold: 70,
    limit: 50,
    daysSinceLastUpdate: 7
  })
});
```

## Testing

### Test Script

Run the test script to verify the feature:

```bash
node test-profile-completion.js
```

This will:
1. Create a test user with incomplete profile
2. Send an interactive profile completion email
3. Test profile update via email form
4. Test automated profile completion check

### Manual Testing

1. **Create User with Incomplete Profile**:
   ```javascript
   const user = new User({
     firstName: 'Test',
     lastName: 'User',
     email: 'test@example.com',
     password: 'password123',
     role: 'user',
     isEmailVerified: true,
     // Leave profile fields empty
   });
   ```

2. **Send Completion Email**:
   ```javascript
   const { sendInteractiveProfileCompletionEmail } = require('./services/emailService');
   const token = await ProfileUpdateToken.createForUser(user._id);
   await sendInteractiveProfileCompletionEmail(user, token.token);
   ```

3. **Update Profile via Email**:
   - Check email for interactive form
   - Fill out the form and submit
   - Or visit the profile update page with the token

## Security Considerations

1. **Token Security**:
   - Tokens are cryptographically secure (32-byte random)
   - Tokens expire after 24 hours
   - Tokens are single-use only
   - IP address and user agent are logged

2. **Email Security**:
   - Only sent to verified email addresses
   - Rate limiting prevents spam
   - Tokens are tied to specific users

3. **Data Validation**:
   - All form inputs are validated
   - SQL injection protection
   - XSS protection

## Monitoring

### Logs

The system logs:
- Email sending attempts and results
- Token creation and usage
- Profile update attempts
- Cron job execution status

### Metrics

Track these metrics:
- Number of incomplete profiles
- Email delivery rates
- Profile completion rates after emails
- Token usage patterns

## Troubleshooting

### Common Issues

1. **Emails Not Sending**:
   - Check email service configuration
   - Verify SMTP credentials
   - Check email service logs

2. **Tokens Not Working**:
   - Verify token hasn't expired
   - Check if token was already used
   - Ensure correct API endpoint

3. **Profile Updates Failing**:
   - Check form validation
   - Verify user exists
   - Check database connection

### Debug Mode

Enable debug logging:
```javascript
// In profileCompletionService.js
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Debug info:', { user, token, result });
}
```

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **A/B Testing**: Test different email formats
3. **Analytics**: Track email engagement and conversion rates
4. **Personalization**: Personalized email content based on user data
5. **Multi-language**: Support for multiple languages
6. **Mobile Optimization**: Better mobile email experience

## Dependencies

- `nodemailer`: Email sending
- `node-cron`: Scheduled tasks
- `mongoose`: Database operations
- `crypto`: Token generation
- `express`: API endpoints
- `react`: Frontend components

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify configuration settings
3. Test with the provided test script
4. Check email service status
5. Verify database connectivity

## Overview

This feature automatically detects users with incomplete profiles and sends them interactive emails where they can update their profile information directly from the email without needing to visit the website.

## Features

- **Automatic Detection**: Identifies users with profiles less than 70% complete
- **Interactive Email**: AMP HTML email with embedded form for profile updates
- **Secure Tokens**: Uses secure tokens for profile updates without requiring login
- **Multiple Update Methods**: Users can update via email form or visit a dedicated page
- **Automated Scheduling**: Cron job runs daily to check for incomplete profiles
- **Admin Controls**: Admin endpoints to manually trigger profile completion checks

## Architecture

### Backend Components

1. **ProfileUpdateToken Model** (`server/src/models/ProfileUpdateToken.js`)
   - Manages secure tokens for profile updates
   - Tracks token usage and expiration
   - Prevents token reuse

2. **Email Service** (`server/src/services/emailService.js`)
   - `sendInteractiveProfileCompletionEmail()` function
   - Creates HTML and AMP HTML versions of the email
   - Includes embedded form for direct profile updates

3. **Profile Completion Service** (`server/src/services/profileCompletionService.js`)
   - `checkAndSendProfileCompletionEmails()` function
   - Identifies users with incomplete profiles
   - Manages email sending logic

4. **Cron Job** (`server/src/jobs/profileCompletionCron.js`)
   - Runs daily at 9:00 AM UTC
   - Automatically checks for incomplete profiles
   - Sends emails to users who need to complete their profiles

5. **API Endpoints** (`server/src/routes/users.js`)
   - `POST /api/users/profile/update-from-email` - Handle profile updates from email
   - `POST /api/users/profile/send-completion-email` - Manually send completion email
   - `POST /api/users/profile/check-incomplete-profiles` - Admin endpoint for bulk checks

### Frontend Components

1. **Profile Update Page** (`client/src/pages/ProfileUpdate.jsx`)
   - Public page accessible via token
   - Form for updating profile information
   - Handles token validation and profile updates

2. **Routing** (`client/src/routes/index.jsx`)
   - Added route for `/profile/update/:token`

## Email Template

The interactive email includes:

- **HTML Version**: Standard email with link to profile update page
- **AMP HTML Version**: Interactive form embedded in email
- **Form Fields**:
  - Skills (comma-separated)
  - Years of Experience
  - Current Position
  - Current Company
  - Current Location
  - Preferred Location
  - Bio/Summary

## API Endpoints

### Update Profile from Email
```http
POST /api/users/profile/update-from-email
Content-Type: application/json

{
  "token": "secure_token_here",
  "skills": "JavaScript, React, Node.js",
  "experienceYears": 5,
  "currentPosition": "Software Engineer",
  "currentCompany": "Tech Corp",
  "currentLocation": "San Francisco, CA",
  "preferredLocation": "Remote",
  "bio": "Experienced developer..."
}
```

### Send Completion Email (User)
```http
POST /api/users/profile/send-completion-email
Authorization: Bearer <user_token>
```

### Check Incomplete Profiles (Admin)
```http
POST /api/users/profile/check-incomplete-profiles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "threshold": 70,
  "limit": 100,
  "daysSinceLastUpdate": 7
}
```

## Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BREVO_SMTP_USER=your-brevo-email
BREVO_SMTP_PASS=your-brevo-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Cron Job Schedule

- **Profile Completion Check**: Daily at 9:00 AM UTC
- **Token Cleanup**: Weekly on Sunday at 2:00 AM UTC

## Usage

### Automatic Operation

The system automatically:
1. Checks for users with incomplete profiles daily
2. Sends interactive emails to users who need to complete their profiles
3. Cleans up expired tokens weekly

### Manual Triggers

#### For Users
```javascript
// Send completion email to current user
const response = await fetch('/api/users/profile/send-completion-email', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### For Admins
```javascript
// Check and send emails to users with incomplete profiles
const response = await fetch('/api/users/profile/check-incomplete-profiles', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    threshold: 70,
    limit: 50,
    daysSinceLastUpdate: 7
  })
});
```

## Testing

### Test Script

Run the test script to verify the feature:

```bash
node test-profile-completion.js
```

This will:
1. Create a test user with incomplete profile
2. Send an interactive profile completion email
3. Test profile update via email form
4. Test automated profile completion check

### Manual Testing

1. **Create User with Incomplete Profile**:
   ```javascript
   const user = new User({
     firstName: 'Test',
     lastName: 'User',
     email: 'test@example.com',
     password: 'password123',
     role: 'user',
     isEmailVerified: true,
     // Leave profile fields empty
   });
   ```

2. **Send Completion Email**:
   ```javascript
   const { sendInteractiveProfileCompletionEmail } = require('./services/emailService');
   const token = await ProfileUpdateToken.createForUser(user._id);
   await sendInteractiveProfileCompletionEmail(user, token.token);
   ```

3. **Update Profile via Email**:
   - Check email for interactive form
   - Fill out the form and submit
   - Or visit the profile update page with the token

## Security Considerations

1. **Token Security**:
   - Tokens are cryptographically secure (32-byte random)
   - Tokens expire after 24 hours
   - Tokens are single-use only
   - IP address and user agent are logged

2. **Email Security**:
   - Only sent to verified email addresses
   - Rate limiting prevents spam
   - Tokens are tied to specific users

3. **Data Validation**:
   - All form inputs are validated
   - SQL injection protection
   - XSS protection

## Monitoring

### Logs

The system logs:
- Email sending attempts and results
- Token creation and usage
- Profile update attempts
- Cron job execution status

### Metrics

Track these metrics:
- Number of incomplete profiles
- Email delivery rates
- Profile completion rates after emails
- Token usage patterns

## Troubleshooting

### Common Issues

1. **Emails Not Sending**:
   - Check email service configuration
   - Verify SMTP credentials
   - Check email service logs

2. **Tokens Not Working**:
   - Verify token hasn't expired
   - Check if token was already used
   - Ensure correct API endpoint

3. **Profile Updates Failing**:
   - Check form validation
   - Verify user exists
   - Check database connection

### Debug Mode

Enable debug logging:
```javascript
// In profileCompletionService.js
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Debug info:', { user, token, result });
}
```

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **A/B Testing**: Test different email formats
3. **Analytics**: Track email engagement and conversion rates
4. **Personalization**: Personalized email content based on user data
5. **Multi-language**: Support for multiple languages
6. **Mobile Optimization**: Better mobile email experience

## Dependencies

- `nodemailer`: Email sending
- `node-cron`: Scheduled tasks
- `mongoose`: Database operations
- `crypto`: Token generation
- `express`: API endpoints
- `react`: Frontend components

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify configuration settings
3. Test with the provided test script
4. Check email service status
5. Verify database connectivity

## Overview

This feature automatically detects users with incomplete profiles and sends them interactive emails where they can update their profile information directly from the email without needing to visit the website.

## Features

- **Automatic Detection**: Identifies users with profiles less than 70% complete
- **Interactive Email**: AMP HTML email with embedded form for profile updates
- **Secure Tokens**: Uses secure tokens for profile updates without requiring login
- **Multiple Update Methods**: Users can update via email form or visit a dedicated page
- **Automated Scheduling**: Cron job runs daily to check for incomplete profiles
- **Admin Controls**: Admin endpoints to manually trigger profile completion checks

## Architecture

### Backend Components

1. **ProfileUpdateToken Model** (`server/src/models/ProfileUpdateToken.js`)
   - Manages secure tokens for profile updates
   - Tracks token usage and expiration
   - Prevents token reuse

2. **Email Service** (`server/src/services/emailService.js`)
   - `sendInteractiveProfileCompletionEmail()` function
   - Creates HTML and AMP HTML versions of the email
   - Includes embedded form for direct profile updates

3. **Profile Completion Service** (`server/src/services/profileCompletionService.js`)
   - `checkAndSendProfileCompletionEmails()` function
   - Identifies users with incomplete profiles
   - Manages email sending logic

4. **Cron Job** (`server/src/jobs/profileCompletionCron.js`)
   - Runs daily at 9:00 AM UTC
   - Automatically checks for incomplete profiles
   - Sends emails to users who need to complete their profiles

5. **API Endpoints** (`server/src/routes/users.js`)
   - `POST /api/users/profile/update-from-email` - Handle profile updates from email
   - `POST /api/users/profile/send-completion-email` - Manually send completion email
   - `POST /api/users/profile/check-incomplete-profiles` - Admin endpoint for bulk checks

### Frontend Components

1. **Profile Update Page** (`client/src/pages/ProfileUpdate.jsx`)
   - Public page accessible via token
   - Form for updating profile information
   - Handles token validation and profile updates

2. **Routing** (`client/src/routes/index.jsx`)
   - Added route for `/profile/update/:token`

## Email Template

The interactive email includes:

- **HTML Version**: Standard email with link to profile update page
- **AMP HTML Version**: Interactive form embedded in email
- **Form Fields**:
  - Skills (comma-separated)
  - Years of Experience
  - Current Position
  - Current Company
  - Current Location
  - Preferred Location
  - Bio/Summary

## API Endpoints

### Update Profile from Email
```http
POST /api/users/profile/update-from-email
Content-Type: application/json

{
  "token": "secure_token_here",
  "skills": "JavaScript, React, Node.js",
  "experienceYears": 5,
  "currentPosition": "Software Engineer",
  "currentCompany": "Tech Corp",
  "currentLocation": "San Francisco, CA",
  "preferredLocation": "Remote",
  "bio": "Experienced developer..."
}
```

### Send Completion Email (User)
```http
POST /api/users/profile/send-completion-email
Authorization: Bearer <user_token>
```

### Check Incomplete Profiles (Admin)
```http
POST /api/users/profile/check-incomplete-profiles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "threshold": 70,
  "limit": 100,
  "daysSinceLastUpdate": 7
}
```

## Configuration

### Environment Variables

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BREVO_SMTP_USER=your-brevo-email
BREVO_SMTP_PASS=your-brevo-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### Cron Job Schedule

- **Profile Completion Check**: Daily at 9:00 AM UTC
- **Token Cleanup**: Weekly on Sunday at 2:00 AM UTC

## Usage

### Automatic Operation

The system automatically:
1. Checks for users with incomplete profiles daily
2. Sends interactive emails to users who need to complete their profiles
3. Cleans up expired tokens weekly

### Manual Triggers

#### For Users
```javascript
// Send completion email to current user
const response = await fetch('/api/users/profile/send-completion-email', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### For Admins
```javascript
// Check and send emails to users with incomplete profiles
const response = await fetch('/api/users/profile/check-incomplete-profiles', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    threshold: 70,
    limit: 50,
    daysSinceLastUpdate: 7
  })
});
```

## Testing

### Test Script

Run the test script to verify the feature:

```bash
node test-profile-completion.js
```

This will:
1. Create a test user with incomplete profile
2. Send an interactive profile completion email
3. Test profile update via email form
4. Test automated profile completion check

### Manual Testing

1. **Create User with Incomplete Profile**:
   ```javascript
   const user = new User({
     firstName: 'Test',
     lastName: 'User',
     email: 'test@example.com',
     password: 'password123',
     role: 'user',
     isEmailVerified: true,
     // Leave profile fields empty
   });
   ```

2. **Send Completion Email**:
   ```javascript
   const { sendInteractiveProfileCompletionEmail } = require('./services/emailService');
   const token = await ProfileUpdateToken.createForUser(user._id);
   await sendInteractiveProfileCompletionEmail(user, token.token);
   ```

3. **Update Profile via Email**:
   - Check email for interactive form
   - Fill out the form and submit
   - Or visit the profile update page with the token

## Security Considerations

1. **Token Security**:
   - Tokens are cryptographically secure (32-byte random)
   - Tokens expire after 24 hours
   - Tokens are single-use only
   - IP address and user agent are logged

2. **Email Security**:
   - Only sent to verified email addresses
   - Rate limiting prevents spam
   - Tokens are tied to specific users

3. **Data Validation**:
   - All form inputs are validated
   - SQL injection protection
   - XSS protection

## Monitoring

### Logs

The system logs:
- Email sending attempts and results
- Token creation and usage
- Profile update attempts
- Cron job execution status

### Metrics

Track these metrics:
- Number of incomplete profiles
- Email delivery rates
- Profile completion rates after emails
- Token usage patterns

## Troubleshooting

### Common Issues

1. **Emails Not Sending**:
   - Check email service configuration
   - Verify SMTP credentials
   - Check email service logs

2. **Tokens Not Working**:
   - Verify token hasn't expired
   - Check if token was already used
   - Ensure correct API endpoint

3. **Profile Updates Failing**:
   - Check form validation
   - Verify user exists
   - Check database connection

### Debug Mode

Enable debug logging:
```javascript
// In profileCompletionService.js
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Debug info:', { user, token, result });
}
```

## Future Enhancements

1. **Email Templates**: Customizable email templates
2. **A/B Testing**: Test different email formats
3. **Analytics**: Track email engagement and conversion rates
4. **Personalization**: Personalized email content based on user data
5. **Multi-language**: Support for multiple languages
6. **Mobile Optimization**: Better mobile email experience

## Dependencies

- `nodemailer`: Email sending
- `node-cron`: Scheduled tasks
- `mongoose`: Database operations
- `crypto`: Token generation
- `express`: API endpoints
- `react`: Frontend components

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify configuration settings
3. Test with the provided test script
4. Check email service status
5. Verify database connectivity



