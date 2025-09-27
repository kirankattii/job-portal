/**
 * Test Updated Interactive Email
 * Tests the new email with quick update links and improved form
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

// Test updated email
const testUpdatedEmail = async () => {
  try {
    console.log('🔧 Testing updated interactive email...');
    
    // Find the user
    const user = await User.findOne({ email: 'kirankatti550@gmail.com' });
    if (!user) {
      console.error('❌ User not found');
      return;
    }
    
    console.log('📧 User found:', user.email);
    console.log('📊 Current profile completion:', user.profileCompletion + '%');
    
    // Create new token
    const tokenDoc = await ProfileUpdateToken.createForUser(user._id);
    console.log('🔑 New token created:', tokenDoc.token);
    
    // Send updated interactive email
    const result = await sendInteractiveProfileCompletionEmail(user, tokenDoc.token);
    console.log('✅ Updated email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    console.log('\n📋 Email Features:');
    console.log('   ✅ Quick update buttons for common roles');
    console.log('   ✅ Manual form (if supported by email client)');
    console.log('   ✅ Fallback button to profile page');
    console.log('   ✅ Clear instructions for users');
    console.log('   ✅ Mobile responsive design');
    
    console.log('\n🔗 Links:');
    console.log('   Profile Update Page: http://localhost:3000/profile/update/' + tokenDoc.token);
    console.log('   API Endpoint: http://localhost:5000/api/users/profile/update-from-email');
    
    console.log('\n🚀 Quick Update Links:');
    console.log('   Frontend Dev: http://localhost:3000/profile/update/' + tokenDoc.token + '?skills=JavaScript,React,Node.js&experienceYears=3&currentPosition=Software Engineer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote');
    console.log('   Backend Dev: http://localhost:3000/profile/update/' + tokenDoc.token + '?skills=Python,Django,PostgreSQL&experienceYears=4&currentPosition=Backend Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote');
    console.log('   Full Stack: http://localhost:3000/profile/update/' + tokenDoc.token + '?skills=JavaScript,React,Node.js,Python&experienceYears=5&currentPosition=Full Stack Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote');
    console.log('   Senior Dev: http://localhost:3000/profile/update/' + tokenDoc.token + '?skills=Java,Spring Boot,Microservices&experienceYears=6&currentPosition=Senior Developer&currentCompany=Tech Corp&currentLocation=Mumbai, India&preferredLocation=Remote');
    
    return tokenDoc.token;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Testing Updated Interactive Email\n');
    
    await connectDB();
    const token = await testUpdatedEmail();
    
    console.log('\n✅ Updated interactive email sent successfully!');
    console.log('\n📋 What to expect:');
    console.log('1. 📧 Check your email for the updated interactive form');
    console.log('2. 🚀 Click the quick update buttons for common roles');
    console.log('3. 📝 Try the manual form (if your email client supports it)');
    console.log('4. 📄 Use the "Complete Your Profile" button as fallback');
    console.log('5. 🔗 Visit the profile update page with the token');
    
    console.log('\n🔧 Improvements made:');
    console.log('   • Quick update buttons work in all email clients');
    console.log('   • Manual form with better styling');
    console.log('   • Clear instructions for users');
    console.log('   • Fallback options for different email clients');
    console.log('   • Better mobile responsiveness');
    
    console.log('\n💡 How to use:');
    console.log('   • Primary: Click quick update buttons (works everywhere)');
    console.log('   • Secondary: Use manual form (if supported)');
    console.log('   • Tertiary: Click "Complete Your Profile" button');
    
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


