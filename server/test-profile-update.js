/**
 * Test Profile Update from Email
 * Test the complete flow of updating profile via email form
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');

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

// Test profile update via API
const testProfileUpdate = async () => {
  try {
    console.log('🔧 Testing profile update via API...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    
    // Find the latest token for this user
    const tokenDoc = await ProfileUpdateToken.findOne({ 
      userId: user._id, 
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!tokenDoc) {
      console.error('❌ No valid token found');
      return;
    }
    
    console.log('🔑 Using token:', tokenDoc.token);
    
    // Test data for profile update
    const updateData = {
      token: tokenDoc.token,
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js',
      experienceYears: 3,
      currentPosition: 'Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune',
      bio: 'Experienced full-stack developer with expertise in modern web technologies. Passionate about building scalable applications and solving complex problems.'
    };
    
    console.log('\n📝 Testing profile update with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated profile data:');
      console.log('   Skills:', result.data.user.skills?.length || 0, 'skills');
      console.log('   Experience:', result.data.user.experienceYears, 'years');
      console.log('   Position:', result.data.user.currentPosition);
      console.log('   Company:', result.data.user.currentCompany);
      console.log('   Location:', result.data.user.currentLocation);
      console.log('   Preferred Location:', result.data.user.preferredLocation);
      console.log('   Bio:', result.data.user.bio ? 'Yes' : 'No');
      
      // Check if token was marked as used
      const updatedToken = await ProfileUpdateToken.findById(tokenDoc._id);
      console.log('\n🔑 Token status after update:');
      console.log('   Used:', updatedToken.used);
      console.log('   Used At:', updatedToken.usedAt);
      console.log('   IP Address:', updatedToken.ipAddress);
      
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Profile Update Test\n');
    
    await connectDB();
    await testProfileUpdate();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
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
 * Test Profile Update from Email
 * Test the complete flow of updating profile via email form
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');

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

// Test profile update via API
const testProfileUpdate = async () => {
  try {
    console.log('🔧 Testing profile update via API...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    
    // Find the latest token for this user
    const tokenDoc = await ProfileUpdateToken.findOne({ 
      userId: user._id, 
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!tokenDoc) {
      console.error('❌ No valid token found');
      return;
    }
    
    console.log('🔑 Using token:', tokenDoc.token);
    
    // Test data for profile update
    const updateData = {
      token: tokenDoc.token,
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js',
      experienceYears: 3,
      currentPosition: 'Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune',
      bio: 'Experienced full-stack developer with expertise in modern web technologies. Passionate about building scalable applications and solving complex problems.'
    };
    
    console.log('\n📝 Testing profile update with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated profile data:');
      console.log('   Skills:', result.data.user.skills?.length || 0, 'skills');
      console.log('   Experience:', result.data.user.experienceYears, 'years');
      console.log('   Position:', result.data.user.currentPosition);
      console.log('   Company:', result.data.user.currentCompany);
      console.log('   Location:', result.data.user.currentLocation);
      console.log('   Preferred Location:', result.data.user.preferredLocation);
      console.log('   Bio:', result.data.user.bio ? 'Yes' : 'No');
      
      // Check if token was marked as used
      const updatedToken = await ProfileUpdateToken.findById(tokenDoc._id);
      console.log('\n🔑 Token status after update:');
      console.log('   Used:', updatedToken.used);
      console.log('   Used At:', updatedToken.usedAt);
      console.log('   IP Address:', updatedToken.ipAddress);
      
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Profile Update Test\n');
    
    await connectDB();
    await testProfileUpdate();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
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
 * Test Profile Update from Email
 * Test the complete flow of updating profile via email form
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
const ProfileUpdateToken = require('./src/models/ProfileUpdateToken');

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

// Test profile update via API
const testProfileUpdate = async () => {
  try {
    console.log('🔧 Testing profile update via API...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    
    // Find the latest token for this user
    const tokenDoc = await ProfileUpdateToken.findOne({ 
      userId: user._id, 
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!tokenDoc) {
      console.error('❌ No valid token found');
      return;
    }
    
    console.log('🔑 Using token:', tokenDoc.token);
    
    // Test data for profile update
    const updateData = {
      token: tokenDoc.token,
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js',
      experienceYears: 3,
      currentPosition: 'Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune',
      bio: 'Experienced full-stack developer with expertise in modern web technologies. Passionate about building scalable applications and solving complex problems.'
    };
    
    console.log('\n📝 Testing profile update with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Make API call to update profile
    const response = await fetch('http://localhost:5000/api/users/profile/update-from-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Profile updated successfully!');
      console.log('📊 New profile completion:', result.data.profileCompletion + '%');
      console.log('👤 Updated profile data:');
      console.log('   Skills:', result.data.user.skills?.length || 0, 'skills');
      console.log('   Experience:', result.data.user.experienceYears, 'years');
      console.log('   Position:', result.data.user.currentPosition);
      console.log('   Company:', result.data.user.currentCompany);
      console.log('   Location:', result.data.user.currentLocation);
      console.log('   Preferred Location:', result.data.user.preferredLocation);
      console.log('   Bio:', result.data.user.bio ? 'Yes' : 'No');
      
      // Check if token was marked as used
      const updatedToken = await ProfileUpdateToken.findById(tokenDoc._id);
      console.log('\n🔑 Token status after update:');
      console.log('   Used:', updatedToken.used);
      console.log('   Used At:', updatedToken.usedAt);
      console.log('   IP Address:', updatedToken.ipAddress);
      
    } else {
      console.error('❌ Profile update failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Profile Update Test\n');
    
    await connectDB();
    await testProfileUpdate();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
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



