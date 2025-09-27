/**
 * Send Updated Interactive Profile Completion Email
 * Tests the new HTML form-based interactive email
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

// Send updated interactive email
const sendUpdatedEmail = async () => {
  try {
    console.log('🔧 Sending updated interactive email...');
    
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
    
    
    return tokenDoc.token;
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    console.log('🚀 Sending Updated Interactive Email\n');
    
    await connectDB();
    const token = await sendUpdatedEmail();
    
    console.log('\n✅ Updated interactive email sent successfully!');
    console.log('\n📋 What to expect:');
    console.log('1. 📧 Check your email for the updated interactive form');
    console.log('2. 📝 Try filling out the form directly in the email');
    console.log('3. 🚀 Click the quick update links for common roles');
    console.log('4. 📄 Use the "Complete Your Profile" button as fallback');
    console.log('5. 🔗 Visit the profile update page with the token');
    
    console.log('\n🔧 Testing the form:');
    console.log('The email now includes:');
    console.log('   • HTML form that works in most email clients');
    console.log('   • Quick update links for common developer roles');
    console.log('   • Fallback button to the profile update page');
    console.log('   • Mobile-responsive design');
    console.log('   • Better compatibility across email clients');
    
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
