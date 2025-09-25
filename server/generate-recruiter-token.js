const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const mongoose = require('mongoose');

async function generateRecruiterToken() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal');
    
    const recruiter = await User.findOne({ role: 'recruiter' });
    
    if (!recruiter) {
      console.log('No recruiter found');
      process.exit(1);
    }
    
    const token = jwt.sign(
      { 
        id: recruiter._id, 
        role: recruiter.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('Recruiter Token:');
    console.log(token);
    console.log('\nRecruiter Info:');
    console.log('Name:', recruiter.firstName, recruiter.lastName);
    console.log('Email:', recruiter.email);
    console.log('Role:', recruiter.role);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

generateRecruiterToken();
