import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import { createCustomError, asyncHandler } from '../middleware/errorHandler';
import { protect, AuthRequest } from '../middleware/auth';
import { ApiResponse, JWTPayload } from '../types';
import { logger } from '../utils/logger';
import { encryptPassword, decryptPassword } from '../utils/encryption';

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

// @desc    WebKiosk Login with Credential Storage
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('enrollmentNumber')
    .notEmpty()
    .withMessage('Enrollment number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('dateOfBirth')
    .optional()
    .notEmpty()
    .withMessage('Date of birth is required'),
  body('rememberCredentials')
    .optional()
    .isBoolean()
    .withMessage('Remember credentials must be boolean'),
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { enrollmentNumber, password, dateOfBirth, rememberCredentials = true } = req.body;

  try {
    // First check if user exists in database with stored credentials
    let user = await User.findOne({ enrollmentNumber }).select('+webkioskCredentials');
    let shouldCreateUser = false;
    
    // If user exists and has stored credentials, try using them first
    if (user?.webkioskCredentials?.encryptedPassword && user?.webkioskCredentials?.autoLoginEnabled) {
      try {
        const storedPassword = decryptPassword(user.webkioskCredentials.encryptedPassword);
        
        // If provided password matches stored password, skip WebKiosk verification
        if (storedPassword === password) {
          logger.info(`Using stored credentials for: ${enrollmentNumber}`);
          
          // Check if credentials were validated recently (within 24 hours)
          const lastValidated = user.webkioskCredentials.lastValidated;
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          if (lastValidated && lastValidated > twentyFourHoursAgo) {
            // Use stored credentials without WebKiosk verification
            const token = generateToken({
              id: user._id!.toString(),
              enrollmentNumber: user.enrollmentNumber,
              isAdmin: false,
            });

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            logger.info(`Quick login successful for: ${enrollmentNumber}`);

            const response: ApiResponse = {
              success: true,
              message: 'Login successful (using stored credentials)',
              data: {
                token,
                user: user.toSafeObject(),
                fromCache: true
              },
              timestamp: new Date(),
            };

            return res.json(response);
          }
        }
      } catch (decryptError) {
        logger.warn(`Failed to decrypt stored credentials for ${enrollmentNumber}:`, decryptError);
        // Continue with WebKiosk verification
      }
    }

    // Verify credentials with WebKiosk
    logger.info(`Attempting WebKiosk authentication for: ${enrollmentNumber}`);
    
    const { WebKioskScraper } = await import('../services/webkioskScraper');
    const scraper = new WebKioskScraper();
    
    try {
      // Verify credentials by attempting to login to WebKiosk
      const credentials = { enrollmentNumber, password, dateOfBirth: dateOfBirth || '' };
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

      // Create or update user with encrypted credentials
      if (!user) {
        // Create new user
        user = new User({
          enrollmentNumber,
          name: studentInfo?.name || 'Student',
          course: studentInfo?.course || 'B.Tech',
          branch: 'CSE',
          semester: studentInfo?.currentSemester || 7,
          passwordHash: await bcrypt.hash(password, 10), // Hash for basic security
          dateOfBirth: dateOfBirth || '',
          webkioskData: {
            attendance: attendanceData,
            sgpa: sgpaData,
            lastSync: new Date(),
          },
          preferences: {
            rememberCredentials: rememberCredentials,
            notifications: true,
            backgroundSync: true,
            theme: 'auto',
          },
        });
      } else {
        // Update existing user data
        user.name = studentInfo?.name || user.name;
        user.course = studentInfo?.course || user.course;
        user.semester = studentInfo?.currentSemester || user.semester;
        user.webkioskData = {
          attendance: attendanceData,
          sgpa: sgpaData,
          lastSync: new Date(),
        };
        if (user.preferences) {
          user.preferences.rememberCredentials = rememberCredentials;
        }
      }

      // Store encrypted credentials if user opted in
      if (rememberCredentials) {
        try {
          const encryptedPassword = encryptPassword(password);
          user.webkioskCredentials = {
            encryptedPassword,
            lastValidated: new Date(),
            autoLoginEnabled: true,
          };
          logger.info(`Stored encrypted credentials for: ${enrollmentNumber}`);
        } catch (encryptError) {
          logger.error('Failed to encrypt credentials:', encryptError);
          // Continue without storing credentials
        }
      }

      // Update login time and save
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken({
        id: user._id!.toString(),
        enrollmentNumber: user.enrollmentNumber,
        isAdmin: false,
      });

      logger.info(`Login successful - scraped ${attendanceData.length} subjects from WebKiosk`);

      // Return success response
      const response: ApiResponse = {
        success: true,
        message: `Login successful - Fetched ${attendanceData.length} subjects from WebKiosk`,
        data: {
          token,
          user: user.toSafeObject(),
          attendance: attendanceData,
          sgpa: sgpaData,
          credentialsStored: rememberCredentials,
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

// Remove duplicate WebKiosk login route since we've integrated it into the main login

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

// @desc    Auto login using stored credentials
// @route   POST /api/auth/auto-login
// @access  Public
router.post('/auto-login', [
  body('enrollmentNumber')
    .notEmpty()
    .withMessage('Enrollment number is required'),
], asyncHandler(async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createCustomError('Validation failed: ' + errors.array().map(e => e.msg).join(', '), 400);
  }

  const { enrollmentNumber } = req.body;

  try {
    // Find user with stored credentials
    const user = await User.findOne({ 
      enrollmentNumber,
      'webkioskCredentials.autoLoginEnabled': true 
    }).select('+webkioskCredentials');
    
    if (!user || !user.webkioskCredentials?.encryptedPassword) {
      throw createCustomError('No stored credentials found for this user', 404);
    }

    // Check if credentials were validated recently (within 24 hours)
    const lastValidated = user.webkioskCredentials.lastValidated;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    if (!lastValidated || lastValidated <= twentyFourHoursAgo) {
      // Credentials need to be re-validated with WebKiosk
      try {
        const storedPassword = decryptPassword(user.webkioskCredentials.encryptedPassword);
        
        logger.info(`Re-validating stored credentials for: ${enrollmentNumber}`);
        
        const { WebKioskScraper } = await import('../services/webkioskScraper');
        const scraper = new WebKioskScraper();
        
        try {
          const credentials = { 
            enrollmentNumber, 
            password: storedPassword, 
            dateOfBirth: user.dateOfBirth || '' 
          };
          const loginSuccess = await scraper.login(credentials);
          
          if (!loginSuccess) {
            // Stored credentials are invalid, remove them
            user.webkioskCredentials.autoLoginEnabled = false;
            await user.save();
            throw createCustomError('Stored credentials are no longer valid. Please login again.', 401);
          }

          // Update validation timestamp
          user.webkioskCredentials.lastValidated = new Date();
          await scraper.cleanup();
          
        } catch (scraperError) {
          await scraper.cleanup();
          throw scraperError;
        }
      } catch (decryptError) {
        logger.error(`Failed to decrypt credentials for ${enrollmentNumber}:`, decryptError);
        throw createCustomError('Failed to decrypt stored credentials. Please login again.', 401);
      }
    }

    // Generate token
    const token = generateToken({
      id: user._id!.toString(),
      enrollmentNumber: user.enrollmentNumber,
      isAdmin: false,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    logger.info(`Auto-login successful for: ${enrollmentNumber}`);

    const response: ApiResponse = {
      success: true,
      message: 'Auto-login successful',
      data: {
        token,
        user: user.toSafeObject(),
        autoLogin: true,
        credentialsValidated: lastValidated && lastValidated > twentyFourHoursAgo ? 'cached' : 'revalidated'
      },
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Auto-login error:', error);
    throw error;
  }
}));

// @desc    Disable auto-login for user
// @route   POST /api/auth/disable-auto-login
// @access  Private
router.post('/disable-auto-login', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await User.findById(req.user!.id).select('+webkioskCredentials');
    
    if (!user) {
      throw createCustomError('User not found', 404);
    }

    // Disable auto-login and clear stored credentials
    if (user.webkioskCredentials) {
      user.webkioskCredentials.autoLoginEnabled = false;
      user.webkioskCredentials.encryptedPassword = undefined as any;
    }
    
    if (user.preferences) {
      user.preferences.rememberCredentials = false;
    }

    await user.save();

    logger.info(`Auto-login disabled for: ${user.enrollmentNumber}`);

    const response: ApiResponse = {
      success: true,
      message: 'Auto-login disabled successfully',
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Disable auto-login error:', error);
    throw error;
  }
}));

export { router as authRoutes };
