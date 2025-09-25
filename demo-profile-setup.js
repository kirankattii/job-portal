/**
 * Demo Profile Setup Script
 * This script demonstrates how to set up a complete user profile
 * with all the features of the profile management system
 */

const demoProfileData = {
  // Personal Information
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  bio: "Experienced software engineer with 5+ years in full-stack development. Passionate about creating scalable web applications and leading development teams.",
  location: {
    city: "San Francisco",
    state: "California",
    country: "United States",
    zipCode: "94105"
  },

  // Professional Details
  currentPosition: "Senior Software Engineer",
  currentCompany: "Tech Corp",
  currentSalary: 120000,
  expectedSalary: 140000,
  experienceYears: 5,
  currentLocation: "San Francisco, CA",
  preferredLocation: "Remote or San Francisco Bay Area",

  // Skills with proficiency levels
  skills: [
    { name: "JavaScript", level: "Expert" },
    { name: "React", level: "Advanced" },
    { name: "Node.js", level: "Advanced" },
    { name: "Python", level: "Intermediate" },
    { name: "AWS", level: "Intermediate" },
    { name: "Docker", level: "Intermediate" },
    { name: "MongoDB", level: "Advanced" },
    { name: "Git", level: "Expert" },
    { name: "Agile", level: "Advanced" },
    { name: "Leadership", level: "Intermediate" }
  ],

  // Work Experience
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: new Date("2022-01-01"),
      endDate: null,
      current: true,
      description: "Lead development of microservices architecture, mentor junior developers, and implement CI/CD pipelines. Improved system performance by 40% and reduced deployment time by 60%."
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: new Date("2020-06-01"),
      endDate: new Date("2021-12-31"),
      current: false,
      description: "Developed full-stack web applications using React and Node.js. Collaborated with cross-functional teams to deliver features on time and within budget."
    },
    {
      title: "Junior Developer",
      company: "WebDev Inc",
      location: "San Jose, CA",
      startDate: new Date("2019-01-01"),
      endDate: new Date("2020-05-31"),
      current: false,
      description: "Built responsive web applications and maintained existing codebase. Gained experience in modern JavaScript frameworks and version control."
    }
  ],

  // Education
  education: [
    {
      institution: "Stanford University",
      degree: "Bachelor's Degree",
      field: "Computer Science",
      startDate: new Date("2015-09-01"),
      endDate: new Date("2019-06-01"),
      current: false,
      gpa: 3.7,
      description: "Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems, Machine Learning."
    },
    {
      institution: "Coursera",
      degree: "Certificate",
      field: "AWS Cloud Practitioner",
      startDate: new Date("2021-03-01"),
      endDate: new Date("2021-06-01"),
      current: false,
      gpa: null,
      description: "Completed comprehensive AWS cloud computing certification covering EC2, S3, Lambda, and other AWS services."
    }
  ],

  // Resume URL (would be set after upload)
  resumeUrl: null,

  // Profile completion and settings
  profileCompletion: 95,
  lastProfileUpdatedAt: new Date(),

  // Preferences
  preferences: {
    emailNotifications: true,
    jobAlerts: true,
    profileVisibility: "public"
  }
};

// Demo API calls to test the profile management system
const demoAPI = {
  // Update profile with demo data
  async updateProfile() {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(demoProfileData)
      });
      
      if (response.ok) {
        console.log('✅ Profile updated successfully');
        return await response.json();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    }
  },

  // Test skill suggestions
  async testSkillSuggestions() {
    const queries = ['java', 'react', 'aws', 'python'];
    
    for (const query of queries) {
      try {
        const response = await fetch(`/api/users/skills/suggestions?q=${query}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`🔍 Skill suggestions for "${query}":`, data.data.suggestions);
        }
      } catch (error) {
        console.error(`❌ Error fetching suggestions for "${query}":`, error);
      }
    }
  },

  // Test popular skills by category
  async testPopularSkills() {
    const categories = ['programming', 'frameworks', 'databases', 'cloud'];
    
    for (const category of categories) {
      try {
        const response = await fetch(`/api/users/skills/suggestions?popular=true&category=${category}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`⭐ Popular ${category} skills:`, data.data.suggestions);
        }
      } catch (error) {
        console.error(`❌ Error fetching popular ${category} skills:`, error);
      }
    }
  },

  // Test skill categories
  async testSkillCategories() {
    try {
      const response = await fetch('/api/users/skills/suggestions?categories=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📂 Skill categories:', data.data.categories);
      }
    } catch (error) {
      console.error('❌ Error fetching skill categories:', error);
    }
  }
};

// Demo profile completion calculation
function calculateProfileCompletion(profile) {
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'bio', 'skills', 'experience', 'education',
    'currentLocation', 'preferredLocation', 'experienceYears', 'currentPosition', 
    'currentCompany', 'currentSalary', 'expectedSalary', 'resumeUrl'
  ];
  
  let filledFields = 0;
  fields.forEach(field => {
    if (profile[field] !== undefined && profile[field] !== null && profile[field] !== '') {
      if (Array.isArray(profile[field])) {
        if (profile[field].length > 0) filledFields++;
      } else {
        filledFields++;
      }
    }
  });
  
  return Math.round((filledFields / fields.length) * 100);
}

// Run demo
console.log('🚀 Starting Profile Management Demo...');
console.log('📊 Demo Profile Completion:', calculateProfileCompletion(demoProfileData) + '%');
console.log('📝 Demo Profile Data:', demoProfileData);

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.demoProfile = demoProfileData;
  window.demoAPI = demoAPI;
  console.log('💡 Demo functions available: demoAPI.updateProfile(), demoAPI.testSkillSuggestions(), etc.');
}

module.exports = { demoProfileData, demoAPI, calculateProfileCompletion };
