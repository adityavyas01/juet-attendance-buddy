import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { createCustomError, asyncHandler } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/auth';
import { ApiResponse, JWTPayload } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// Generate JWT Token
const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('enrollmentNumber')
    .matches(/^[0-9]{2}[A-Z][0-9]{3}$/)
    .withMessage('Invalid enrollment number format'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('course')
    .notEmpty()
    .withMessage('Course is required'),
  body('branch')
    .notEmpty()
    .withMessage('Branch is required'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('dateOfBirth')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date of birth must be in YYYY-MM-DD format'),
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { enrollmentNumber, name, course, branch, semester, password, dateOfBirth } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ enrollmentNumber });
  if (existingUser) {
    throw createCustomError('User already exists with this enrollment number', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    enrollmentNumber,
    name,
    course,
    branch,
    semester,
    passwordHash,
    dateOfBirth,
  });

  // Generate token
  const token = generateToken({
    id: user._id!.toString(),
    enrollmentNumber: user.enrollmentNumber,
    isAdmin: false,
  });

  logger.info(`New user registered: ${enrollmentNumber}`);

  const response: ApiResponse = {
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: user.toSafeObject(),
    },
    timestamp: new Date(),
  };

  res.status(201).json(response);
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('enrollmentNumber')
    .notEmpty()
    .withMessage('Enrollment number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { enrollmentNumber, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ enrollmentNumber });
  if (!user) {
    throw createCustomError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw createCustomError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordMatch) {
    throw createCustomError('Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({
    id: user._id!.toString(),
    enrollmentNumber: user.enrollmentNumber,
    isAdmin: false,
  });

  logger.info(`User logged in: ${enrollmentNumber}`);

  const response: ApiResponse = {
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: user.toSafeObject(),
    },
    timestamp: new Date(),
  };

  res.json(response);
}));

// @desc    WebKiosk Login (Direct authentication with WebKiosk)
// @route   POST /api/auth/webkiosk-login
// @access  Public
router.post('/webkiosk-login', [
  body('enrollmentNumber')
    .notEmpty()
    .withMessage('Enrollment number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required'),
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { enrollmentNumber, password, dateOfBirth } = req.body;

  // Log raw input to debug conversion
  logger.info(`Raw input - dateOfBirth: "${dateOfBirth}", type: ${typeof dateOfBirth}`);

  try {
    // Real WebKiosk authentication ONLY
    logger.info(`Attempting real WebKiosk authentication for: ${enrollmentNumber}`);
    
    // Initialize WebKiosk scraper to verify credentials
    const { WebKioskScraper } = await import('../services/webkioskScraper');
    const scraper = new WebKioskScraper();
    
    try {
      // Verify credentials by attempting to login to WebKiosk
      const credentials = { enrollmentNumber, password, dateOfBirth };
      const loginSuccess = await scraper.login(credentials);
      
      if (!loginSuccess) {
        throw createCustomError('Invalid WebKiosk credentials', 401);
      }

      // Fetch student data from WebKiosk
      const scrapedData = await scraper.scrapeAttendance();
      const attendanceData = scrapedData.subjects || [];
      const studentInfo = scrapedData.studentInfo || {};
      
      // Fetch SGPA/CGPA data
      logger.info('Fetching SGPA/CGPA data...');
      const sgpaData = await scraper.scrapeSGPACGPA();
      logger.info(`Fetched SGPA data for ${sgpaData.length} semesters`);

      // Always cleanup scraper
      await scraper.cleanup();

    // Log successful data scraping
    logger.info(`Login successful - scraped ${attendanceData.length} subjects from WebKiosk`);

    // Generate a simple token without database dependency
    const token = generateToken({
      id: enrollmentNumber, // Use enrollment as ID
      enrollmentNumber: enrollmentNumber,
      isAdmin: false,
    });

    logger.info(`Student logged in via WebKiosk: ${enrollmentNumber}`);

    // Return scraped data directly - no database needed!
    const response: ApiResponse = {
      success: true,
      message: `Login successful - Fetched ${attendanceData.length} subjects from WebKiosk`,
      data: {
        token,
        user: {
          enrollmentNumber: enrollmentNumber,
          name: studentInfo?.name || 'Student',
          course: studentInfo?.course || 'B.Tech',
          branch: 'CSE',
          semester: studentInfo?.currentSemester || 7,
          dateOfBirth: dateOfBirth, // Use the original login DOB
        },
        attendance: attendanceData,
        sgpa: sgpaData,
      },
      timestamp: new Date(),
    };

    res.json(response);
    } catch (scraperError) {
      // Ensure cleanup happens even if scraping fails
      await scraper.cleanup();
      throw scraperError;
    }
  } catch (error) {
    logger.error('WebKiosk login error:', error);
    throw createCustomError('Failed to authenticate with WebKiosk. Please check your credentials.', 401);
  }
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const user = await User.findById(req.user!.id);
  
  if (!user) {
    throw createCustomError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'User data retrieved successfully',
    data: user.toSafeObject(),
    timestamp: new Date(),
  };

  res.json(response);
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('preferences.notifications')
    .optional()
    .isBoolean()
    .withMessage('Notifications preference must be boolean'),
  body('preferences.backgroundSync')
    .optional()
    .isBoolean()
    .withMessage('Background sync preference must be boolean'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    throw createCustomError('User not found', 404);
  }

  const allowedUpdates = ['name', 'preferences'];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    throw createCustomError('Invalid updates', 400);
  }

  // Update user fields
  if (req.body.name) user.name = req.body.name;
  if (req.body.preferences) {
    user.preferences = { ...user.preferences, ...req.body.preferences };
  }

  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated successfully',
    data: user.toSafeObject(),
    timestamp: new Date(),
  };

  res.json(response);
}));

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
], asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id);
  
  if (!user) {
    throw createCustomError('User not found', 404);
  }

  // Check current password
  const isPasswordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordMatch) {
    throw createCustomError('Current password is incorrect', 400);
  }

  // Hash new password
  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);

  await user.save();

  const response: ApiResponse = {
    success: true,
    message: 'Password changed successfully',
    timestamp: new Date(),
  };

  res.json(response);
}));

export { router as authRoutes };
