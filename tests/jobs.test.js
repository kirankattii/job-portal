// Jest + Supertest tests for job posting and apply flow
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock DB connection
jest.mock('../server/src/config/db', () => jest.fn());

// Quiet logger in tests
jest.mock('../server/src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock queue and matching worker
jest.mock('../server/src/utils/queue', () => ({ enqueueTask: jest.fn((fn) => fn && Promise.resolve()) }));
jest.mock('../server/src/jobs/matchingWorker', () => ({ runMatchForJob: jest.fn(async () => true) }));

// In-memory stores
const mockUsers = new Map();
const mockJobs = new Map();
const mockApplications = new Map();

// Mock User model
jest.mock('../server/src/models/User', () => {
  class UserMock {
    constructor(data) {
      Object.assign(this, data);
      this._id = this._id || `user_${Math.random().toString(36).slice(2, 8)}`;
      this.isActive = this.isActive !== false;
      this.isEmailVerified = this.isEmailVerified !== false;
      this.role = this.role || 'user';
    }
    static findOne(query) {
      const email = query && query.email;
      const found = [...mockUsers.values()].find((u) => u.email === email);
      return {
        select: () => Promise.resolve(found ? { ...found, comparePassword: async (pw) => pw === found.password } : null),
      };
    }
    static findById(id) {
      const found = mockUsers.get(id);
      return {
        select: () => Promise.resolve(found ? { ...found } : null),
      };
    }
    async save() {
      mockUsers.set(this._id, { ...this, comparePassword: async (pw) => pw === this.password });
      return this;
    }
    async comparePassword(password) { return password === this.password; }
  }
  return UserMock;
});

// Mock Job model
jest.mock('../server/src/models/Job', () => {
  class JobMock {
    constructor(data) {
      Object.assign(this, data);
      this._id = this._id || `job_${Math.random().toString(36).slice(2, 8)}`;
      this.status = this.status || 'open';
    }
    static async findById(id) {
      return mockJobs.get(id) || null;
    }
    async save() {
      mockJobs.set(this._id, { ...this });
      return this;
    }
  }
  return JobMock;
});

// Mock Application model
jest.mock('../server/src/models/Application', () => {
  class ApplicationMock {
    constructor(data) {
      Object.assign(this, data);
      this._id = this._id || `app_${Math.random().toString(36).slice(2, 8)}`;
    }
    async save() {
      mockApplications.set(this._id, { ...this });
      return this;
    }
  }
  return ApplicationMock;
});

// Mock Recruiter model for email company name
jest.mock('../server/src/models/Recruiter', () => {
  class RecruiterMock {
    static async findById(id) { return { _id: id, companyName: 'Acme Corp' }; }
  }
  return RecruiterMock;
});

// Mock AI service
jest.mock('../server/src/services/aiService', () => ({
  computeMatchScore: jest.fn(async () => ({ score: 88, matchedSkills: ['js'], missingSkills: ['go'] })),
}));

// Mock email service
jest.mock('../server/src/services/emailService', () => ({
  sendApplicationConfirmation: jest.fn(async () => true),
  sendRecruiterNotification: jest.fn(async () => true),
}));

// Mock cloudinary upload via uploadMulter helper
jest.mock('../server/src/middleware/uploadMulter', () => ({
  resumeUpload: (req, res, next) => next(),
  uploadBufferToCloudinary: jest.fn(async () => ({ secure_url: 'https://cdn.example.com/resume.pdf' })),
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.NODE_ENV = 'test';

const app = require('../server/src/server');

function issueTokenFor(user) {
  mockUsers.set(user._id, user);
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('Jobs API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Recruiter can post a job', async () => {
    const recruiter = { _id: 'recruiter_1', email: 'recruiter@acme.com', role: 'recruiter', isActive: true, isEmailVerified: true };
    const token = issueTokenFor(recruiter);

    const payload = {
      title: 'Senior Backend Engineer',
      description: 'Build APIs',
      requiredSkills: ['node', 'mongodb'],
      experienceMin: 3,
      experienceMax: 7,
      location: 'Remote',
      remote: true,
      salaryRange: { min: 1000000, max: 2000000 }
    };

    const res = await request(app)
      .post('/api/recruiter/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.jobId).toBeTruthy();
  });

  test('User can apply to a job (resumeUrl in body)', async () => {
    // Seed recruiter and job
    const recruiter = { _id: 'recruiter_2', email: 'recruiter2@acme.com', role: 'recruiter', isActive: true, isEmailVerified: true };
    mockUsers.set(recruiter._id, recruiter);
    const Job = require('../server/src/models/Job');
    const job = new Job({ recruiter: recruiter._id, title: 'Frontend Dev', location: 'BLR' });
    await job.save();

    const user = { _id: 'user_2', email: 'bob@example.com', role: 'user', isActive: true, isEmailVerified: true };
    const token = issueTokenFor(user);

    const res = await request(app)
      .post(`/api/jobs/${job._id}/apply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ resumeUrl: 'https://files.example.com/bob.pdf', coverLetter: 'I am interested.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.applicationId).toBeTruthy();
    expect(typeof res.body.data.matchScore).toBe('number');
  });
});


