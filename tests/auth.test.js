// Jest + Supertest basic auth flow tests
const request = require('supertest');

// Mock DB connection to avoid real Mongo
jest.mock('../server/src/config/db', () => jest.fn());

// Quiet logger in tests
jest.mock('../server/src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock email service to avoid sending real emails
jest.mock('../server/src/services/emailService', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(true),
}));

// Provide controlled OTP behaviors
const saveMock = jest.fn().mockResolvedValue(true);
jest.mock('../server/src/models/Otp', () => {
  return {
    generateOtp: jest.fn(() => '123456'),
    verifyOtpForEmail: jest.fn(async (email, otp, purpose) => otp === '123456' && purpose === 'registration'),
    default: function () {},
  };
});

// Mock Otp constructor separately (since controller uses `new Otp()`)
const Otp = require('../server/src/models/Otp');
function OtpCtor(data) {
  Object.assign(this, data);
  this.save = saveMock;
}
// Override module exports to simulate constructor usage
Object.setPrototypeOf(OtpCtor, Otp);
jest.setMock('../server/src/models/Otp', Object.assign(Otp, OtpCtor));

// Mock User model
let mockInMemoryUser = null;
jest.mock('../server/src/models/User', () => {
  class UserMock {
    constructor(data) {
      Object.assign(this, data);
      this._id = this._id || 'user_1';
      this.isActive = this.isActive !== false;
      this.isEmailVerified = this.isEmailVerified ?? true;
      this.role = this.role || 'user';
      this.profileCompletion = this.profileCompletion || 0;
    }
    static findOne(query) {
      const email = (query && query.email) ? query.email : null;
      return {
        select: () => Promise.resolve(mockInMemoryUser && mockInMemoryUser.email === email ? mockInMemoryUser : null),
        then: undefined,
      };
    }
    static findById(id) {
      return {
        select: () => Promise.resolve(mockInMemoryUser && (mockInMemoryUser._id === id) ? mockInMemoryUser : null),
      };
    }
    async save() {
      mockInMemoryUser = this;
      return this;
    }
    async comparePassword(password) {
      return password === this.password;
    }
  }
  return UserMock;
});

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.NODE_ENV = 'test';

const app = require('../server/src/server');

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('register -> verify-otp -> login flow', async () => {
    const email = 'alice@example.com';
    const name = 'Alice Example';
    const password = 'StrongP@ss1';

    // 1) Register (OTP send mocked)
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email, name });

    expect(regRes.statusCode).toBe(200);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.message).toMatch(/OTP sent/i);

    // 2) Verify OTP (mocked to accept 123456)
    const verifyRes = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email, otp: '123456', password, name });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.token).toBeTruthy();
    expect(verifyRes.body.data.user.email).toBe(email.toLowerCase());

    // 3) Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeTruthy();
    expect(loginRes.body.data.user.email).toBe(email.toLowerCase());
  });
});


