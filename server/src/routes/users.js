const express = require('express');
const router = express.Router();
const { verifyToken, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { resumeUpload, uploadBufferToCloudinary } = require('../middleware/uploadMulter');
const { parseResumeFromUrl } = require('../services/resumeParser');
const User = require('../models/User');
const { calculateProfileCompletion } = require('../utils/profile');
const userController = require('../controllers/userController');

// Placeholder user routes - to be implemented with controllers
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
}));

router.put('/profile', verifyToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate email if provided (should be unique)
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Remove fields that shouldn't be updated directly
    const restrictedFields = ['_id', 'password', 'role', 'isEmailVerified', 'emailVerificationToken', 'emailVerificationExpires', 'passwordResetToken', 'passwordResetExpires', 'createdAt', 'updatedAt'];
    restrictedFields.forEach(field => delete updateData[field]);

    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        user[key] = updateData[key];
      }
    });

    // Save the user (this will trigger pre-save middleware for profile completion and embeddings)
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
}));

router.get('/applications', verifyToken, authorize('user'), asyncHandler(require('../controllers/applicationController').getUserApplications));

router.get('/applications/:applicationId', verifyToken, authorize('user'), asyncHandler(require('../controllers/applicationController').getApplicationDetails));

router.get('/applications/export', verifyToken, authorize('user'), asyncHandler(require('../controllers/applicationController').exportApplications));

router.post('/applications/:jobId', verifyToken, authorize('user'), (req, res, next) => {
  resumeUpload(req, res, function(err) {
    if (err) return next(err);
    next();
  });
}, asyncHandler(userController.applyToJobViaUsers));

router.post('/applications/:jobId/draft', verifyToken, authorize('user'), asyncHandler(require('../controllers/applicationController').saveApplicationDraft));

router.get('/saved-jobs', verifyToken, authorize('user'), asyncHandler(userController.getSavedJobs));

router.post('/saved-jobs/:jobId', verifyToken, authorize('user'), asyncHandler(userController.saveJob));

router.delete('/saved-jobs/:jobId', verifyToken, authorize('user'), asyncHandler(userController.removeSavedJob));

// Debug endpoint to check saved jobs
router.get('/saved-jobs/debug', verifyToken, authorize('user'), asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const SavedJob = require('../models/SavedJob');
    
    const savedJobs = await SavedJob.find({ user: userId }).select('job savedAt');
    const jobIds = savedJobs.map(sj => sj.job.toString());
    
    res.json({
      success: true,
      data: {
        userId,
        totalSavedJobs: savedJobs.length,
        savedJobIds: jobIds,
        savedJobs: savedJobs
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: err.message
    });
  }
}));

// POST /api/users/upload-resume
// - Accepts multipart/form-data with field "resume"
// - Uploads to Cloudinary (resource_type raw)
// - Parses with Gemini via resumeParser
// - Autofills user profile fields and stores resumeUrl
router.post('/upload-resume', verifyToken, authorize('user'), (req, res) => {
  resumeUpload(req, res, async (err) => {
    try {
      if (err) {
        const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(status).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // 1) Upload to Cloudinary as raw
      const uploadResult = await uploadBufferToCloudinary(req.file, `users/${req.user._id}/resume`, {
        folder: `users/${req.user._id}/resume`,
        resource_type: 'raw'
      });

      // 2) Parse resume using Gemini
      let parsed = {};
      try {
        parsed = await parseResumeFromUrl(uploadResult.secure_url);
      } catch (e) {
        // Continue even if parsing fails; we still save resumeUrl
        parsed = {};
      }

      // 3) Map parsed fields to User model
      const updates = {};

      // Name
      if (parsed.full_name && typeof parsed.full_name === 'string') {
        const nameParts = parsed.full_name.trim().split(/\s+/);
        if (nameParts.length > 0) updates.firstName = nameParts[0];
        if (nameParts.length > 1) updates.lastName = nameParts.slice(1).join(' ');
      }
      // Contact
      if (parsed.email && typeof parsed.email === 'string') updates.email = parsed.email.toLowerCase();
      if (parsed.phone && typeof parsed.phone === 'string') updates.phone = parsed.phone;
      // Skills (array of strings -> [{name}])
      if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
        updates.skills = parsed.skills
          .filter(s => typeof s === 'string' && s.trim().length > 0)
          .map(s => ({ name: s.trim(), level: 'Intermediate' }));
      }
      // Experience years
      if (parsed.experience_years != null && !Number.isNaN(Number(parsed.experience_years))) {
        updates.experienceYears = Number(parsed.experience_years);
      }
      // Current position/company
      if (parsed.current_position && typeof parsed.current_position === 'string') updates.currentPosition = parsed.current_position;
      if (parsed.current_company && typeof parsed.current_company === 'string') updates.currentCompany = parsed.current_company;
      // Preferred location
      if (parsed.preferred_location && typeof parsed.preferred_location === 'string') updates.preferredLocation = parsed.preferred_location;
      // Education (string -> push as description if empty)
      const educationDescription = typeof parsed.education === 'string' ? parsed.education : null;

      // Always store resumeUrl
      updates.resumeUrl = uploadResult.secure_url;

      // 4) Load, apply, and save to trigger hooks (profileCompletion, embeddings)
      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      Object.assign(user, updates);

      if (educationDescription) {
        if (!Array.isArray(user.education) || user.education.length === 0) {
          user.education = [{ description: educationDescription }];
        } else if (!user.education[0].description) {
          user.education[0].description = educationDescription;
        }
      }

      await user.save();

      // Update completionPercentage (without triggering another save)
      const completionPercentage = calculateProfileCompletion(user);
      user.completionPercentage = completionPercentage;
      const sanitized = user.toJSON();
      sanitized.completionPercentage = completionPercentage;

      return res.status(201).json({
        success: true,
        data: sanitized
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
});

// GET /api/users/skills/suggestions
// Get skill suggestions based on query, category, or popular skills
router.get('/skills/suggestions', verifyToken, authorize('user'), asyncHandler(async (req, res) => {
  try {
    const { q, category, popular, categories } = req.query;
    
    // Return categories if requested
    if (categories === 'true') {
      const skillCategories = [
        { id: 'programming', name: 'Programming Languages', icon: '💻' },
        { id: 'frameworks', name: 'Frameworks & Libraries', icon: '⚛️' },
        { id: 'databases', name: 'Databases', icon: '🗄️' },
        { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️' },
        { id: 'tools', name: 'Tools & Technologies', icon: '🛠️' },
        { id: 'soft-skills', name: 'Soft Skills', icon: '🤝' },
        { id: 'design', name: 'Design & UI/UX', icon: '🎨' },
        { id: 'mobile', name: 'Mobile Development', icon: '📱' },
        { id: 'data', name: 'Data Science & AI', icon: '📊' },
        { id: 'management', name: 'Project Management', icon: '📋' }
      ];

      return res.json({
        success: true,
        data: { categories: skillCategories }
      });
    }

    // Return popular skills if requested
    if (popular === 'true') {
      const popularSkills = {
        all: [
          'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker',
          'Git', 'SQL', 'Agile', 'Communication', 'Problem Solving',
          'TypeScript', 'Java', 'MongoDB', 'Kubernetes', 'Linux'
        ],
        programming: ['JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust'],
        frameworks: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django'],
        databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch'],
        cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
        tools: ['Git', 'Linux', 'CI/CD', 'GraphQL', 'REST API', 'Microservices'],
        'soft-skills': ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Agile'],
        design: ['Figma', 'Adobe Creative Suite', 'UI/UX', 'Web Design', 'Photoshop'],
        mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
        data: ['Machine Learning', 'Data Science', 'Python', 'R', 'TensorFlow', 'Pandas'],
        management: ['Agile', 'Scrum', 'Project Management', 'Leadership', 'Communication']
      };

      const skills = popularSkills[category] || popularSkills.all;
      return res.json({
        success: true,
        data: { suggestions: skills }
      });
    }

    // Return search suggestions
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Comprehensive skills database with categories
    const skillsDatabase = [
      // Programming Languages
      { name: 'JavaScript', category: 'programming', popularity: 95 },
      { name: 'Python', category: 'programming', popularity: 90 },
      { name: 'Java', category: 'programming', popularity: 85 },
      { name: 'TypeScript', category: 'programming', popularity: 80 },
      { name: 'C++', category: 'programming', popularity: 75 },
      { name: 'Go', category: 'programming', popularity: 70 },
      { name: 'Rust', category: 'programming', popularity: 65 },
      { name: 'C#', category: 'programming', popularity: 75 },
      { name: 'PHP', category: 'programming', popularity: 70 },
      { name: 'Ruby', category: 'programming', popularity: 60 },
      
      // Frameworks & Libraries
      { name: 'React', category: 'frameworks', popularity: 90 },
      { name: 'Vue.js', category: 'frameworks', popularity: 80 },
      { name: 'Angular', category: 'frameworks', popularity: 75 },
      { name: 'Node.js', category: 'frameworks', popularity: 85 },
      { name: 'Express.js', category: 'frameworks', popularity: 80 },
      { name: 'Django', category: 'frameworks', popularity: 75 },
      { name: 'Flask', category: 'frameworks', popularity: 70 },
      { name: 'Spring Boot', category: 'frameworks', popularity: 75 },
      { name: 'Laravel', category: 'frameworks', popularity: 70 },
      { name: 'Next.js', category: 'frameworks', popularity: 80 },
      
      // Databases
      { name: 'MongoDB', category: 'databases', popularity: 80 },
      { name: 'PostgreSQL', category: 'databases', popularity: 85 },
      { name: 'MySQL', category: 'databases', popularity: 80 },
      { name: 'Redis', category: 'databases', popularity: 75 },
      { name: 'Elasticsearch', category: 'databases', popularity: 70 },
      { name: 'SQLite', category: 'databases', popularity: 65 },
      { name: 'Oracle', category: 'databases', popularity: 60 },
      
      // Cloud & DevOps
      { name: 'AWS', category: 'cloud', popularity: 90 },
      { name: 'Azure', category: 'cloud', popularity: 80 },
      { name: 'Google Cloud', category: 'cloud', popularity: 75 },
      { name: 'Docker', category: 'cloud', popularity: 85 },
      { name: 'Kubernetes', category: 'cloud', popularity: 80 },
      { name: 'Terraform', category: 'cloud', popularity: 70 },
      { name: 'Jenkins', category: 'cloud', popularity: 65 },
      
      // Tools & Technologies
      { name: 'Git', category: 'tools', popularity: 95 },
      { name: 'Linux', category: 'tools', popularity: 80 },
      { name: 'CI/CD', category: 'tools', popularity: 75 },
      { name: 'GraphQL', category: 'tools', popularity: 70 },
      { name: 'REST API', category: 'tools', popularity: 85 },
      { name: 'Microservices', category: 'tools', popularity: 75 },
      { name: 'Webpack', category: 'tools', popularity: 65 },
      
      // Soft Skills
      { name: 'Communication', category: 'soft-skills', popularity: 95 },
      { name: 'Leadership', category: 'soft-skills', popularity: 85 },
      { name: 'Problem Solving', category: 'soft-skills', popularity: 90 },
      { name: 'Teamwork', category: 'soft-skills', popularity: 90 },
      { name: 'Agile', category: 'soft-skills', popularity: 85 },
      { name: 'Scrum', category: 'soft-skills', popularity: 80 },
      { name: 'Time Management', category: 'soft-skills', popularity: 80 },
      
      // Design & UI/UX
      { name: 'Figma', category: 'design', popularity: 85 },
      { name: 'Adobe Creative Suite', category: 'design', popularity: 75 },
      { name: 'UI/UX', category: 'design', popularity: 80 },
      { name: 'Web Design', category: 'design', popularity: 75 },
      { name: 'Photoshop', category: 'design', popularity: 70 },
      { name: 'Sketch', category: 'design', popularity: 65 },
      
      // Mobile Development
      { name: 'React Native', category: 'mobile', popularity: 80 },
      { name: 'Flutter', category: 'mobile', popularity: 75 },
      { name: 'iOS', category: 'mobile', popularity: 70 },
      { name: 'Android', category: 'mobile', popularity: 70 },
      { name: 'Swift', category: 'mobile', popularity: 65 },
      { name: 'Kotlin', category: 'mobile', popularity: 65 },
      
      // Data Science & AI
      { name: 'Machine Learning', category: 'data', popularity: 80 },
      { name: 'Data Science', category: 'data', popularity: 75 },
      { name: 'TensorFlow', category: 'data', popularity: 70 },
      { name: 'Pandas', category: 'data', popularity: 70 },
      { name: 'NumPy', category: 'data', popularity: 65 },
      { name: 'Artificial Intelligence', category: 'data', popularity: 75 },
      
      // Project Management
      { name: 'Project Management', category: 'management', popularity: 80 },
      { name: 'Jira', category: 'management', popularity: 70 },
      { name: 'Confluence', category: 'management', popularity: 65 },
      { name: 'Trello', category: 'management', popularity: 60 }
    ];

    // Filter skills based on query and category
    let filteredSkills = skillsDatabase.filter(skill => 
      skill.name.toLowerCase().includes(q.toLowerCase())
    );

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredSkills = filteredSkills.filter(skill => skill.category === category);
    }

    // Sort by popularity and limit results
    const suggestions = filteredSkills
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10)
      .map(skill => skill.name);

    res.json({
      success: true,
      data: { suggestions }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skill suggestions',
      error: error.message
    });
  }
}));

module.exports = router;
