const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const RECRUITER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDc0ZjJkYjQzYmIwYmFkNjA5NWIxZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODk0MTI2OCwiZXhwIjoxNzU5NTQ2MDY4fQ.BnsnGj0kkSrVb7O7mIkCdIKr_C2s7OIRlIcQ6BoJBFE';

// Job data with all required fields
const jobs = [
  {
    title: "Software Engineer",
    description: "We are looking for a talented Software Engineer to join our development team. You will be responsible for designing, developing, and maintaining software applications. The ideal candidate should have strong programming skills, experience with modern frameworks, and a passion for creating high-quality software solutions.",
    requiredSkills: ["JavaScript", "Node.js", "React", "MongoDB", "Git", "RESTful APIs", "TypeScript"],
    experienceMin: 2,
    experienceMax: 5,
    location: "San Francisco, CA",
    remote: true,
    salaryRange: {
      min: 80000,
      max: 120000
    }
  },
  {
    title: "Frontend Engineer",
    description: "Join our frontend team to build beautiful, responsive, and user-friendly web applications. You will work with modern JavaScript frameworks, implement responsive designs, and ensure optimal user experience across all devices. Experience with React, Vue, or Angular is required.",
    requiredSkills: ["JavaScript", "React", "HTML5", "CSS3", "TypeScript", "Webpack", "Redux", "Responsive Design"],
    experienceMin: 1,
    experienceMax: 4,
    location: "New York, NY",
    remote: true,
    salaryRange: {
      min: 70000,
      max: 110000
    }
  },
  {
    title: "Backend Engineer",
    description: "We need a skilled Backend Engineer to design and implement server-side logic, manage databases, and ensure high performance and responsiveness of our applications. You will work with various backend technologies and cloud platforms to build scalable systems.",
    requiredSkills: ["Python", "Node.js", "PostgreSQL", "MongoDB", "Docker", "AWS", "RESTful APIs", "GraphQL"],
    experienceMin: 3,
    experienceMax: 6,
    location: "Austin, TX",
    remote: true,
    salaryRange: {
      min: 90000,
      max: 130000
    }
  },
  {
    title: "DevOps Engineer",
    description: "Join our DevOps team to manage infrastructure, automate deployments, and ensure system reliability. You will work with cloud platforms, containerization technologies, and CI/CD pipelines to maintain and improve our development and production environments.",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux", "Python", "Monitoring"],
    experienceMin: 2,
    experienceMax: 5,
    location: "Seattle, WA",
    remote: true,
    salaryRange: {
      min: 85000,
      max: 125000
    }
  },
  {
    title: "Cloud Engineer",
    description: "We are seeking a Cloud Engineer to design, implement, and manage cloud infrastructure solutions. You will work with AWS, Azure, or GCP to build scalable, secure, and cost-effective cloud architectures. Experience with infrastructure as code and cloud security is essential.",
    requiredSkills: ["AWS", "Azure", "Terraform", "CloudFormation", "Docker", "Kubernetes", "Python", "Security"],
    experienceMin: 3,
    experienceMax: 7,
    location: "Denver, CO",
    remote: true,
    salaryRange: {
      min: 95000,
      max: 140000
    }
  },
  {
    title: "UI/UX Designer",
    description: "Join our design team to create intuitive and engaging user experiences. You will conduct user research, create wireframes and prototypes, and collaborate with developers to implement designs. Strong portfolio and experience with design tools required.",
    requiredSkills: ["Figma", "Adobe Creative Suite", "Sketch", "User Research", "Prototyping", "HTML/CSS", "Design Systems", "Accessibility"],
    experienceMin: 2,
    experienceMax: 5,
    location: "Los Angeles, CA",
    remote: true,
    salaryRange: {
      min: 65000,
      max: 95000
    }
  },
  {
    title: "Project Manager",
    description: "We need an experienced Project Manager to lead cross-functional teams and deliver projects on time and within budget. You will manage project timelines, coordinate with stakeholders, and ensure successful project delivery using agile methodologies.",
    requiredSkills: ["Agile", "Scrum", "Project Management", "Jira", "Communication", "Risk Management", "Team Leadership", "Budget Management"],
    experienceMin: 3,
    experienceMax: 8,
    location: "Chicago, IL",
    remote: true,
    salaryRange: {
      min: 75000,
      max: 115000
    }
  },
  {
    title: "Full Stack Developer",
    description: "Join our team as a Full Stack Developer to work on both frontend and backend development. You will build end-to-end solutions, work with modern technologies, and contribute to the full software development lifecycle. Versatility and strong problem-solving skills are key.",
    requiredSkills: ["JavaScript", "React", "Node.js", "MongoDB", "PostgreSQL", "Git", "Docker", "AWS"],
    experienceMin: 2,
    experienceMax: 6,
    location: "Boston, MA",
    remote: true,
    salaryRange: {
      min: 80000,
      max: 120000
    }
  },
  {
    title: "Web Developer",
    description: "We are looking for a Web Developer to create and maintain websites and web applications. You will work with HTML, CSS, JavaScript, and various frameworks to build responsive and interactive web experiences. Knowledge of modern web development practices is essential.",
    requiredSkills: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js", "Bootstrap", "Git", "Responsive Design"],
    experienceMin: 1,
    experienceMax: 4,
    location: "Miami, FL",
    remote: true,
    salaryRange: {
      min: 60000,
      max: 90000
    }
  }
];

async function createJob(jobData) {
  try {
    const response = await axios.post(`${BASE_URL}/api/recruiter/jobs`, jobData, {
      headers: {
        'Authorization': `Bearer ${RECRUITER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data,
      jobTitle: jobData.title
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      jobTitle: jobData.title
    };
  }
}

async function postAllJobs() {
  console.log('🚀 Starting to post jobs to the database...\n');
  
  const results = [];
  
  for (const job of jobs) {
    console.log(`📝 Posting job: ${job.title}`);
    const result = await createJob(job);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ Successfully posted: ${job.title} (ID: ${result.data.data.jobId})`);
    } else {
      console.log(`❌ Failed to post: ${job.title}`);
      console.log(`   Error: ${JSON.stringify(result.error)}`);
    }
    console.log('');
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('===========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successfully posted: ${successful.length} jobs`);
  console.log(`❌ Failed to post: ${failed.length} jobs`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully posted jobs:');
    successful.forEach(result => {
      console.log(`   - ${result.jobTitle}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed jobs:');
    failed.forEach(result => {
      console.log(`   - ${result.jobTitle}: ${JSON.stringify(result.error)}`);
    });
  }
  
  console.log('\n🎉 Job posting completed!');
}

// Run the script
postAllJobs().catch(console.error);
