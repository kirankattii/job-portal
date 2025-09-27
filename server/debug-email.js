/**
 * Debug Email Service
 * Test email sending with detailed error logging
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test email sending
const testEmailSending = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NOT SET');
    console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
    console.log('BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '***' : 'NOT SET');
    
    // Find or create test user
    let user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        firstName: 'Kiran',
        lastName: 'Katti',
        email: 'kirankatti550@gmail.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        skills: [],
        experienceYears: null,
        currentPosition: '',
        currentCompany: '',
        currentLocation: '',
        preferredLocation: '',
        bio: '',
        resumeUrl: '',
        phone: ''
      });
      await user.save();
    }
    
    console.log('📧 User found/created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    // Create token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Token created:', tokenDoc.token);
    
    // Test email sending with detailed error handling
    console.log('\n📧 Attempting to send email...');
    
    try {
      const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('🔗 Profile update URL: http://localhost:3000/profile/update/' + tokenDoc.token);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code
      });
      
      // Try to get more details about the error
      if (emailError.response) {
        console.error('SMTP Response:', emailError.response);
      }
      if (emailError.command) {
        console.error('SMTP Command:', emailError.command);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Email Debug Test\n');
    
    await connectDB();
    await testEmailSending();
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}
 * Debug Email Service
 * Test email sending with detailed error logging
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test email sending
const testEmailSending = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NOT SET');
    console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
    console.log('BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '***' : 'NOT SET');
    
    // Find or create test user
    let user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        firstName: 'Kiran',
        lastName: 'Katti',
        email: 'kirankatti550@gmail.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        skills: [],
        experienceYears: null,
        currentPosition: '',
        currentCompany: '',
        currentLocation: '',
        preferredLocation: '',
        bio: '',
        resumeUrl: '',
        phone: ''
      });
      await user.save();
    }
    
    console.log('📧 User found/created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    // Create token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Token created:', tokenDoc.token);
    
    // Test email sending with detailed error handling
    console.log('\n📧 Attempting to send email...');
    
    try {
      const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('🔗 Profile update URL: http://localhost:3000/profile/update/' + tokenDoc.token);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code
      });
      
      // Try to get more details about the error
      if (emailError.response) {
        console.error('SMTP Response:', emailError.response);
      }
      if (emailError.command) {
        console.error('SMTP Command:', emailError.command);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Email Debug Test\n');
    
    await connectDB();
    await testEmailSending();
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}
 * Debug Email Service
 * Test email sending with detailed error logging
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test email sending
const testEmailSending = async () => {
  try {
    console.log('🔧 Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NOT SET');
    console.log('BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
    console.log('BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '***' : 'NOT SET');
    
    // Find or create test user
    let user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    
    if (!user) {
      console.log('Creating test user...');
      user = new User({
        firstName: 'Kiran',
        lastName: 'Katti',
        email: 'kirankatti550@gmail.com',
        password: 'password123',
        role: 'user',
        isEmailVerified: true,
        isActive: true,
        skills: [],
        experienceYears: null,
        currentPosition: '',
        currentCompany: '',
        currentLocation: '',
        preferredLocation: '',
        bio: '',
        resumeUrl: '',
        phone: ''
      });
      await user.save();
    }
    
    console.log('📧 User found/created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    // Create token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Token created:', tokenDoc.token);
    
    // Test email sending with detailed error handling
    console.log('\n📧 Attempting to send email...');
    
    try {
      const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('🔗 Profile update URL: http://localhost:3000/profile/update/' + tokenDoc.token);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code
      });
      
      // Try to get more details about the error
      if (emailError.response) {
        console.error('SMTP Response:', emailError.response);
      }
      if (emailError.command) {
        console.error('SMTP Command:', emailError.command);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Email Debug Test\n');
    
    await connectDB();
    await testEmailSending();
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}



