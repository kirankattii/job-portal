const express = require('express');
const { 
  register, 
  verifyOtp, 
  login, 
  resendOtp, 
  getProfile, 
  logout,
  changePassword
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register user with email and send OTP
 * @access  Public
 * @body    { email: string, name: string }
 * @returns { success: boolean, message: string, data?: { email: string } }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and create/update user
 * @access  Public
 * @body    { email: string, otp: string, password?: string }
 * @returns { success: boolean, message: string, data: { token: string, user: object } }
 */
router.post('/verify-otp', verifyOtp);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 * @body    { email: string, password: string }
 * @returns { success: boolean, message: string, data: { token: string, user: object } }
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for registration
 * @access  Public
 * @body    { email: string }
 * @returns { success: boolean, message: string, data?: { email: string } }
 */
router.post('/resend-otp', resendOtp);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @returns { success: boolean, data: { user: object } }
 */
router.get('/me', verifyToken, getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @returns { success: boolean, message: string }
 */
router.post('/logout', verifyToken, logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 * @body    { currentPassword: string, newPassword: string }
 */
router.post('/change-password', verifyToken, changePassword);

module.exports = router;