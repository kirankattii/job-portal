/**
 * Test Script for Profile Completion Email Feature
 * 
 * This script demonstrates how to:
 * 1. Create a user with incomplete profile
 * 2. Send interactive profile completion email
 * 3. Update profile via email form
 * 4. Check profile completion status
 */

const mongoose = require('mongoose');
const User = require('./server/src/models/User');
const ProfileUpdateToken = require('./server/src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./server/src/services/emailService');
const { checkAndSendProfileCompletionEmails } = require('./server/src/services/profileCompletionService');

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

// Create a test user with incomplete profile
const createTestUser = async () => {
  try {
    // Check if test user already exists
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      console.log('📧 Test user already exists:', user.email);
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile
      skills: [],
      experienceYears: null,
      currentPosition: '',
      currentCompany: '',
      currentLocation: '',
      preferredLocation: '',
      bio: '',
      resumeUrl: ''
    });

    await user.save();
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
};

// Test sending interactive profile completion email
const testSendEmail = async (user) => {
  try {
    console.log('\n📧 Testing interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Test profile update via email form
const testProfileUpdate = async (token) => {
  try {
    console.log('\n📝 Testing profile update via email form...');
    
    // Simulate form data from email
    const formData = {
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'San Francisco, CA',
      preferredLocation: 'Remote, New York',
      bio: 'Experienced software engineer with expertise in full-stack development and modern web technologies.'
    };
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated user data:', {
        skills: result.data.user.skills?.length || 0,
        experienceYears: result.data.user.experienceYears,
        currentPosition: result.data.user.currentPosition,
        currentCompany: result.data.user.currentCompany,
        currentLocation: result.data.user.currentLocation,
        preferredLocation: result.data.user.preferredLocation,
        bio: result.data.user.bio ? 'Yes' : 'No'
      });
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

// Test automated profile completion check
const testAutomatedCheck = async () => {
  try {
    console.log('\n🤖 Testing automated profile completion check...');
    
    const result = await checkAndSendProfileCompletionEmails({
      threshold: 70,
      limit: 10,
      daysSinceLastUpdate: 0 // Check all users for testing
    });
    
    console.log('📊 Automated check results:', {
      totalChecked: result.totalChecked,
      emailsSent: result.emailsSent,
      errors: result.errors,
      skipped: result.skipped
    });
    
    if (result.details.length > 0) {
      console.log('📋 Details:', result.details);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in automated check:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Profile Completion Email Feature Tests\n');
    
    // Connect to database
    await connectDB();
    
    // Create test user
    const user = await createTestUser();
    
    // Test sending email
    const token = await testSendEmail(user);
    
    // Test profile update
    await testProfileUpdate(token);
    
    // Test automated check
    await testAutomatedCheck();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('1. ✅ Created test user with incomplete profile');
    console.log('2. ✅ Sent interactive profile completion email');
    console.log('3. ✅ Updated profile via email form');
    console.log('4. ✅ Tested automated profile completion check');
    
    console.log('\n🔗 Next steps:');
    console.log('1. Check your email for the interactive profile completion email');
    console.log('2. Try updating the profile using the form in the email');
    console.log('3. Visit the profile update page: http://localhost:3000/profile/update/' + token);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  createTestUser,
  testSendEmail,
  testProfileUpdate,
  testAutomatedCheck,
  runTests
};
 * Test Script for Profile Completion Email Feature
 * 
 * This script demonstrates how to:
 * 1. Create a user with incomplete profile
 * 2. Send interactive profile completion email
 * 3. Update profile via email form
 * 4. Check profile completion status
 */

const mongoose = require('mongoose');
const User = require('./server/src/models/User');
const ProfileUpdateToken = require('./server/src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./server/src/services/emailService');
const { checkAndSendProfileCompletionEmails } = require('./server/src/services/profileCompletionService');

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

// Create a test user with incomplete profile
const createTestUser = async () => {
  try {
    // Check if test user already exists
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      console.log('📧 Test user already exists:', user.email);
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile
      skills: [],
      experienceYears: null,
      currentPosition: '',
      currentCompany: '',
      currentLocation: '',
      preferredLocation: '',
      bio: '',
      resumeUrl: ''
    });

    await user.save();
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
};

// Test sending interactive profile completion email
const testSendEmail = async (user) => {
  try {
    console.log('\n📧 Testing interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Test profile update via email form
const testProfileUpdate = async (token) => {
  try {
    console.log('\n📝 Testing profile update via email form...');
    
    // Simulate form data from email
    const formData = {
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'San Francisco, CA',
      preferredLocation: 'Remote, New York',
      bio: 'Experienced software engineer with expertise in full-stack development and modern web technologies.'
    };
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated user data:', {
        skills: result.data.user.skills?.length || 0,
        experienceYears: result.data.user.experienceYears,
        currentPosition: result.data.user.currentPosition,
        currentCompany: result.data.user.currentCompany,
        currentLocation: result.data.user.currentLocation,
        preferredLocation: result.data.user.preferredLocation,
        bio: result.data.user.bio ? 'Yes' : 'No'
      });
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

// Test automated profile completion check
const testAutomatedCheck = async () => {
  try {
    console.log('\n🤖 Testing automated profile completion check...');
    
    const result = await checkAndSendProfileCompletionEmails({
      threshold: 70,
      limit: 10,
      daysSinceLastUpdate: 0 // Check all users for testing
    });
    
    console.log('📊 Automated check results:', {
      totalChecked: result.totalChecked,
      emailsSent: result.emailsSent,
      errors: result.errors,
      skipped: result.skipped
    });
    
    if (result.details.length > 0) {
      console.log('📋 Details:', result.details);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in automated check:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Profile Completion Email Feature Tests\n');
    
    // Connect to database
    await connectDB();
    
    // Create test user
    const user = await createTestUser();
    
    // Test sending email
    const token = await testSendEmail(user);
    
    // Test profile update
    await testProfileUpdate(token);
    
    // Test automated check
    await testAutomatedCheck();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('1. ✅ Created test user with incomplete profile');
    console.log('2. ✅ Sent interactive profile completion email');
    console.log('3. ✅ Updated profile via email form');
    console.log('4. ✅ Tested automated profile completion check');
    
    console.log('\n🔗 Next steps:');
    console.log('1. Check your email for the interactive profile completion email');
    console.log('2. Try updating the profile using the form in the email');
    console.log('3. Visit the profile update page: http://localhost:3000/profile/update/' + token);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  createTestUser,
  testSendEmail,
  testProfileUpdate,
  testAutomatedCheck,
  runTests
};
 * Test Script for Profile Completion Email Feature
 * 
 * This script demonstrates how to:
 * 1. Create a user with incomplete profile
 * 2. Send interactive profile completion email
 * 3. Update profile via email form
 * 4. Check profile completion status
 */

const mongoose = require('mongoose');
const User = require('./server/src/models/User');
const ProfileUpdateToken = require('./server/src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./server/src/services/emailService');
const { checkAndSendProfileCompletionEmails } = require('./server/src/services/profileCompletionService');

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

// Create a test user with incomplete profile
const createTestUser = async () => {
  try {
    // Check if test user already exists
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (user) {
      console.log('📧 Test user already exists:', user.email);
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile
      skills: [],
      experienceYears: null,
      currentPosition: '',
      currentCompany: '',
      currentLocation: '',
      preferredLocation: '',
      bio: '',
      resumeUrl: ''
    });

    await user.save();
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
};

// Test sending interactive profile completion email
const testSendEmail = async (user) => {
  try {
    console.log('\n📧 Testing interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Test profile update via email form
const testProfileUpdate = async (token) => {
  try {
    console.log('\n📝 Testing profile update via email form...');
    
    // Simulate form data from email
    const formData = {
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'San Francisco, CA',
      preferredLocation: 'Remote, New York',
      bio: 'Experienced software engineer with expertise in full-stack development and modern web technologies.'
    };
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated user data:', {
        skills: result.data.user.skills?.length || 0,
        experienceYears: result.data.user.experienceYears,
        currentPosition: result.data.user.currentPosition,
        currentCompany: result.data.user.currentCompany,
        currentLocation: result.data.user.currentLocation,
        preferredLocation: result.data.user.preferredLocation,
        bio: result.data.user.bio ? 'Yes' : 'No'
      });
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

// Test automated profile completion check
const testAutomatedCheck = async () => {
  try {
    console.log('\n🤖 Testing automated profile completion check...');
    
    const result = await checkAndSendProfileCompletionEmails({
      threshold: 70,
      limit: 10,
      daysSinceLastUpdate: 0 // Check all users for testing
    });
    
    console.log('📊 Automated check results:', {
      totalChecked: result.totalChecked,
      emailsSent: result.emailsSent,
      errors: result.errors,
      skipped: result.skipped
    });
    
    if (result.details.length > 0) {
      console.log('📋 Details:', result.details);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in automated check:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('🚀 Starting Profile Completion Email Feature Tests\n');
    
    // Connect to database
    await connectDB();
    
    // Create test user
    const user = await createTestUser();
    
    // Test sending email
    const token = await testSendEmail(user);
    
    // Test profile update
    await testProfileUpdate(token);
    
    // Test automated check
    await testAutomatedCheck();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('1. ✅ Created test user with incomplete profile');
    console.log('2. ✅ Sent interactive profile completion email');
    console.log('3. ✅ Updated profile via email form');
    console.log('4. ✅ Tested automated profile completion check');
    
    console.log('\n🔗 Next steps:');
    console.log('1. Check your email for the interactive profile completion email');
    console.log('2. Try updating the profile using the form in the email');
    console.log('3. Visit the profile update page: http://localhost:3000/profile/update/' + token);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  createTestUser,
  testSendEmail,
  testProfileUpdate,
  testAutomatedCheck,
  runTests
};



