/**
 * Test Script to Send Profile Completion Email
 * Sends an interactive profile completion email to a specific email address
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

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

// Create or find test user
const createOrFindTestUser = async (email) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('📧 User already exists:', user.email);
      console.log('📊 Current profile completion:', user.profileCompletion + '%');
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'Kiran',
      lastName: 'Katti',
      email: email.toLowerCase(),
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile to trigger email
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
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating/finding test user:', error);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (user) => {
  try {
    console.log('\n📧 Sending interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // Display important information
    console.log('\n📋 Email Details:');
    console.log('   To:', user.email);
    console.log('   Subject: Complete Your Profile - Interactive Update');
    console.log('   Token:', tokenDoc.token);
    console.log('   Profile Completion:', user.profileCompletion + '%');
    
    console.log('\n🔗 Links:');
    console.log('   Profile Update Page: http://localhost:3000/profile/update/' + tokenDoc.token);
    console.log('   API Endpoint: http://localhost:5000/api/users/profile/update-from-email');
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Test Email Send\n');
    
    // Connect to database
    await connectDB();
    
    // Create or find test user
    const user = await createOrFindTestUser('kirankatti550@gmail.com');
    
    // Send test email
    const token = await sendTestEmail(user);
    
    console.log('\n✅ Test email sent successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox for the interactive profile completion email');
    console.log('2. Try updating your profile using the form in the email');
    console.log('3. Or visit the profile update page with the token');
    console.log('4. Check the email for both HTML and AMP HTML versions');
    
    console.log('\n🔧 Testing the Profile Update:');
    console.log('You can test the profile update by making a POST request to:');
    console.log('POST http://localhost:5000/api/users/profile/update-from-email');
    console.log('With body:');
    console.log(JSON.stringify({
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'Mumbai, India',
      preferredLocation: 'Remote, Bangalore',
      bio: 'Experienced software engineer with expertise in full-stack development.'
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

 * Sends an interactive profile completion email to a specific email address
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

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

// Create or find test user
const createOrFindTestUser = async (email) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('📧 User already exists:', user.email);
      console.log('📊 Current profile completion:', user.profileCompletion + '%');
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'Kiran',
      lastName: 'Katti',
      email: email.toLowerCase(),
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile to trigger email
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
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating/finding test user:', error);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (user) => {
  try {
    console.log('\n📧 Sending interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // Display important information
    console.log('\n📋 Email Details:');
    console.log('   To:', user.email);
    console.log('   Subject: Complete Your Profile - Interactive Update');
    console.log('   Token:', tokenDoc.token);
    console.log('   Profile Completion:', user.profileCompletion + '%');
    
    console.log('\n🔗 Links:');
    console.log('   Profile Update Page: http://localhost:3000/profile/update/' + tokenDoc.token);
    console.log('   API Endpoint: http://localhost:5000/api/users/profile/update-from-email');
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Test Email Send\n');
    
    // Connect to database
    await connectDB();
    
    // Create or find test user
    const user = await createOrFindTestUser('kirankatti550@gmail.com');
    
    // Send test email
    const token = await sendTestEmail(user);
    
    console.log('\n✅ Test email sent successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox for the interactive profile completion email');
    console.log('2. Try updating your profile using the form in the email');
    console.log('3. Or visit the profile update page with the token');
    console.log('4. Check the email for both HTML and AMP HTML versions');
    
    console.log('\n🔧 Testing the Profile Update:');
    console.log('You can test the profile update by making a POST request to:');
    console.log('POST http://localhost:5000/api/users/profile/update-from-email');
    console.log('With body:');
    console.log(JSON.stringify({
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'Mumbai, India',
      preferredLocation: 'Remote, Bangalore',
      bio: 'Experienced software engineer with expertise in full-stack development.'
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };

 * Sends an interactive profile completion email to a specific email address
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');
const { sendInteractiveProfileCompletionEmail } = require('./src/services/emailService');

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

// Create or find test user
const createOrFindTestUser = async (email) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      console.log('📧 User already exists:', user.email);
      console.log('📊 Current profile completion:', user.profileCompletion + '%');
      return user;
    }

    // Create new test user with incomplete profile
    user = new User({
      firstName: 'Kiran',
      lastName: 'Katti',
      email: email.toLowerCase(),
      password: 'password123',
      role: 'user',
      isEmailVerified: true,
      isActive: true,
      // Intentionally incomplete profile to trigger email
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
    console.log('✅ Test user created:', user.email);
    console.log('📊 Profile completion:', user.profileCompletion + '%');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating/finding test user:', error);
    throw error;
  }
};

// Send test email
const sendTestEmail = async (user) => {
  try {
    console.log('\n📧 Sending interactive profile completion email...');
    
    // Create profile update token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 Profile update token created:', tokenDoc.token);
    
    // Send interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    // Display important information
    console.log('\n📋 Email Details:');
    console.log('   To:', user.email);
    console.log('   Subject: Complete Your Profile - Interactive Update');
    console.log('   Token:', tokenDoc.token);
    console.log('   Profile Completion:', user.profileCompletion + '%');
    
    console.log('\n🔗 Links:');
    console.log('   Profile Update Page: http://localhost:3000/profile/update/' + tokenDoc.token);
    console.log('   API Endpoint: http://localhost:5000/api/users/profile/update-from-email');
    
    return tokenDoc.token;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Test Email Send\n');
    
    // Connect to database
    await connectDB();
    
    // Create or find test user
    const user = await createOrFindTestUser('kirankatti550@gmail.com');
    
    // Send test email
    const token = await sendTestEmail(user);
    
    console.log('\n✅ Test email sent successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox for the interactive profile completion email');
    console.log('2. Try updating your profile using the form in the email');
    console.log('3. Or visit the profile update page with the token');
    console.log('4. Check the email for both HTML and AMP HTML versions');
    
    console.log('\n🔧 Testing the Profile Update:');
    console.log('You can test the profile update by making a POST request to:');
    console.log('POST http://localhost:5000/api/users/profile/update-from-email');
    console.log('With body:');
    console.log(JSON.stringify({
      token: token,
      skills: 'JavaScript, React, Node.js, Python',
      experienceYears: 5,
      currentPosition: 'Software Engineer',
      currentCompany: 'Tech Corp',
      currentLocation: 'Mumbai, India',
      preferredLocation: 'Remote, Bangalore',
      bio: 'Experienced software engineer with expertise in full-stack development.'
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };
