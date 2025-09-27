/**
 * Test Direct Profile Update
 * Test the profile update logic directly without API
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

// Test direct profile update
const testDirectUpdate = async () => {
  try {
    console.log('🔧 Testing direct profile update...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    console.log('👤 Current profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears || 'Not set');
    console.log('   Position:', user.currentPosition || 'Not set');
    console.log('   Company:', user.currentCompany || 'Not set');
    console.log('   Location:', user.currentLocation || 'Not set');
    console.log('   Bio:', user.bio || 'Not set');
    
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
    
    console.log('\n🔑 Using token:', tokenDoc.token);
    
    // Simulate the profile update logic from the API
    const updateData = {
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js, TypeScript',
      experienceYears: 4,
      currentPosition: 'Senior Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune, Hyderabad',
      bio: 'Experienced senior full-stack developer with 4+ years of expertise in modern web technologies. Passionate about building scalable applications, leading development teams, and solving complex problems. Strong background in JavaScript, React, Node.js, and cloud technologies.'
    };
    
    console.log('\n📝 Updating profile with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Parse skills from comma-separated string
    if (updateData.skills) {
      const skillsArray = updateData.skills.split(',').map(skill => ({
        name: skill.trim(),
        level: 'Intermediate'
      })).filter(skill => skill.name.length > 0);
      
      if (skillsArray.length > 0) {
        user.skills = skillsArray;
      }
    }
    
    // Update other fields
    if (updateData.experienceYears !== undefined && updateData.experienceYears !== null) {
      user.experienceYears = parseInt(updateData.experienceYears);
    }
    
    if (updateData.currentPosition) {
      user.currentPosition = updateData.currentPosition.trim();
    }
    
    if (updateData.currentCompany) {
      user.currentCompany = updateData.currentCompany.trim();
    }
    
    if (updateData.currentLocation) {
      user.currentLocation = updateData.currentLocation.trim();
    }
    
    if (updateData.preferredLocation) {
      user.preferredLocation = updateData.preferredLocation.trim();
    }
    
    if (updateData.bio) {
      user.bio = updateData.bio.trim();
    }
    
    // Save the user (this will trigger pre-save middleware for profile completion and embeddings)
    await user.save();
    
    console.log('\n✅ Profile updated successfully!');
    console.log('📊 New profile completion:', user.profileCompletion + '%');
    console.log('👤 Updated profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears, 'years');
    console.log('   Position:', user.currentPosition);
    console.log('   Company:', user.currentCompany);
    console.log('   Location:', user.currentLocation);
    console.log('   Preferred Location:', user.preferredLocation);
    console.log('   Bio:', user.bio ? 'Yes' : 'No');
    
    // Mark token as used
    tokenDoc.used = true;
    tokenDoc.usedAt = new Date();
    tokenDoc.ipAddress = '127.0.0.1';
    tokenDoc.userAgent = 'Test Script';
    await tokenDoc.save();
    
    console.log('\n🔑 Token marked as used');
    console.log('   Used At:', tokenDoc.usedAt);
    console.log('   IP Address:', tokenDoc.ipAddress);
    
    // Show the improvement
    const improvement = user.profileCompletion - 35; // Previous completion was 35%
    console.log('\n📈 Profile completion improved by:', improvement + '%');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Direct Profile Update Test\n');
    
    await connectDB();
    await testDirectUpdate();
    
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
 * Test Direct Profile Update
 * Test the profile update logic directly without API
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

// Test direct profile update
const testDirectUpdate = async () => {
  try {
    console.log('🔧 Testing direct profile update...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    console.log('👤 Current profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears || 'Not set');
    console.log('   Position:', user.currentPosition || 'Not set');
    console.log('   Company:', user.currentCompany || 'Not set');
    console.log('   Location:', user.currentLocation || 'Not set');
    console.log('   Bio:', user.bio || 'Not set');
    
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
    
    console.log('\n🔑 Using token:', tokenDoc.token);
    
    // Simulate the profile update logic from the API
    const updateData = {
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js, TypeScript',
      experienceYears: 4,
      currentPosition: 'Senior Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune, Hyderabad',
      bio: 'Experienced senior full-stack developer with 4+ years of expertise in modern web technologies. Passionate about building scalable applications, leading development teams, and solving complex problems. Strong background in JavaScript, React, Node.js, and cloud technologies.'
    };
    
    console.log('\n📝 Updating profile with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Parse skills from comma-separated string
    if (updateData.skills) {
      const skillsArray = updateData.skills.split(',').map(skill => ({
        name: skill.trim(),
        level: 'Intermediate'
      })).filter(skill => skill.name.length > 0);
      
      if (skillsArray.length > 0) {
        user.skills = skillsArray;
      }
    }
    
    // Update other fields
    if (updateData.experienceYears !== undefined && updateData.experienceYears !== null) {
      user.experienceYears = parseInt(updateData.experienceYears);
    }
    
    if (updateData.currentPosition) {
      user.currentPosition = updateData.currentPosition.trim();
    }
    
    if (updateData.currentCompany) {
      user.currentCompany = updateData.currentCompany.trim();
    }
    
    if (updateData.currentLocation) {
      user.currentLocation = updateData.currentLocation.trim();
    }
    
    if (updateData.preferredLocation) {
      user.preferredLocation = updateData.preferredLocation.trim();
    }
    
    if (updateData.bio) {
      user.bio = updateData.bio.trim();
    }
    
    // Save the user (this will trigger pre-save middleware for profile completion and embeddings)
    await user.save();
    
    console.log('\n✅ Profile updated successfully!');
    console.log('📊 New profile completion:', user.profileCompletion + '%');
    console.log('👤 Updated profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears, 'years');
    console.log('   Position:', user.currentPosition);
    console.log('   Company:', user.currentCompany);
    console.log('   Location:', user.currentLocation);
    console.log('   Preferred Location:', user.preferredLocation);
    console.log('   Bio:', user.bio ? 'Yes' : 'No');
    
    // Mark token as used
    tokenDoc.used = true;
    tokenDoc.usedAt = new Date();
    tokenDoc.ipAddress = '127.0.0.1';
    tokenDoc.userAgent = 'Test Script';
    await tokenDoc.save();
    
    console.log('\n🔑 Token marked as used');
    console.log('   Used At:', tokenDoc.usedAt);
    console.log('   IP Address:', tokenDoc.ipAddress);
    
    // Show the improvement
    const improvement = user.profileCompletion - 35; // Previous completion was 35%
    console.log('\n📈 Profile completion improved by:', improvement + '%');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Direct Profile Update Test\n');
    
    await connectDB();
    await testDirectUpdate();
    
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
 * Test Direct Profile Update
 * Test the profile update logic directly without API
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

// Test direct profile update
const testDirectUpdate = async () => {
  try {
    console.log('🔧 Testing direct profile update...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    console.log('👤 Current profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears || 'Not set');
    console.log('   Position:', user.currentPosition || 'Not set');
    console.log('   Company:', user.currentCompany || 'Not set');
    console.log('   Location:', user.currentLocation || 'Not set');
    console.log('   Bio:', user.bio || 'Not set');
    
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
    
    console.log('\n🔑 Using token:', tokenDoc.token);
    
    // Simulate the profile update logic from the API
    const updateData = {
      skills: 'JavaScript, React, Node.js, Python, MongoDB, Express.js, TypeScript',
      experienceYears: 4,
      currentPosition: 'Senior Full Stack Developer',
      currentCompany: 'Tech Solutions Inc',
      currentLocation: 'Mumbai, Maharashtra, India',
      preferredLocation: 'Remote, Bangalore, Pune, Hyderabad',
      bio: 'Experienced senior full-stack developer with 4+ years of expertise in modern web technologies. Passionate about building scalable applications, leading development teams, and solving complex problems. Strong background in JavaScript, React, Node.js, and cloud technologies.'
    };
    
    console.log('\n📝 Updating profile with data:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Parse skills from comma-separated string
    if (updateData.skills) {
      const skillsArray = updateData.skills.split(',').map(skill => ({
        name: skill.trim(),
        level: 'Intermediate'
      })).filter(skill => skill.name.length > 0);
      
      if (skillsArray.length > 0) {
        user.skills = skillsArray;
      }
    }
    
    // Update other fields
    if (updateData.experienceYears !== undefined && updateData.experienceYears !== null) {
      user.experienceYears = parseInt(updateData.experienceYears);
    }
    
    if (updateData.currentPosition) {
      user.currentPosition = updateData.currentPosition.trim();
    }
    
    if (updateData.currentCompany) {
      user.currentCompany = updateData.currentCompany.trim();
    }
    
    if (updateData.currentLocation) {
      user.currentLocation = updateData.currentLocation.trim();
    }
    
    if (updateData.preferredLocation) {
      user.preferredLocation = updateData.preferredLocation.trim();
    }
    
    if (updateData.bio) {
      user.bio = updateData.bio.trim();
    }
    
    // Save the user (this will trigger pre-save middleware for profile completion and embeddings)
    await user.save();
    
    console.log('\n✅ Profile updated successfully!');
    console.log('📊 New profile completion:', user.profileCompletion + '%');
    console.log('👤 Updated profile data:');
    console.log('   Skills:', user.skills?.length || 0, 'skills');
    console.log('   Experience:', user.experienceYears, 'years');
    console.log('   Position:', user.currentPosition);
    console.log('   Company:', user.currentCompany);
    console.log('   Location:', user.currentLocation);
    console.log('   Preferred Location:', user.preferredLocation);
    console.log('   Bio:', user.bio ? 'Yes' : 'No');
    
    // Mark token as used
    tokenDoc.used = true;
    tokenDoc.usedAt = new Date();
    tokenDoc.ipAddress = '127.0.0.1';
    tokenDoc.userAgent = 'Test Script';
    await tokenDoc.save();
    
    console.log('\n🔑 Token marked as used');
    console.log('   Used At:', tokenDoc.usedAt);
    console.log('   IP Address:', tokenDoc.ipAddress);
    
    // Show the improvement
    const improvement = user.profileCompletion - 35; // Previous completion was 35%
    console.log('\n📈 Profile completion improved by:', improvement + '%');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Starting Direct Profile Update Test\n');
    
    await connectDB();
    await testDirectUpdate();
    
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



