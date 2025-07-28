import express from 'express';
import jwt from 'jsonwebtoken';
import { WebKioskScraper } from '../services/webkioskScraper';
import { logger } from '../utils/logger';

const router = express.Router();

// Initialize WebKiosk scraper
const scraper = new WebKioskScraper();

// Generate JWT Token
const generateToken = (payload: any): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Login with WebKiosk
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { enrollmentNumber, password, dateOfBirth } = req.body;
  
  try {
    logger.info(`🔐 Attempting login for: ${enrollmentNumber}`);
    
    // Attempt real WebKiosk login
    const loginSuccess = await scraper.login({
      enrollmentNumber,
      password,
      dateOfBirth
    });

    if (loginSuccess) {
      // Fetch user profile from WebKiosk
      const userProfile = await scraper.getUserProfile();
      
      logger.info(`✅ Login successful for: ${enrollmentNumber}`);
      
      const user = {
        id: enrollmentNumber,
        enrollmentNumber,
        name: userProfile?.name || `Student ${enrollmentNumber}`,
        course: userProfile?.course || 'B.Tech',
        branch: userProfile?.branch || 'CSE',
        semester: userProfile?.semester || 6,
      };

      const token = generateToken({ id: user.id, enrollmentNumber: user.enrollmentNumber });

      res.json({
        success: true,
        data: {
          user,
          token
        },
        message: 'Login successful'
      });
    } else {
      logger.warn(`❌ Login failed for: ${enrollmentNumber}`);
      res.status(401).json({
        success: false,
        message: 'Invalid credentials or WebKiosk is not accessible'
      });
    }
  } catch (error) {
    logger.error('🚨 Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + (error as Error).message
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const userProfile = await scraper.getUserProfile();
    
    res.json({
      success: true,
      data: userProfile || {
        id: '1',
        enrollmentNumber: '20BCS101',
        name: 'Test Student',
        course: 'B.Tech (CSE)',
        branch: 'Computer Science & Engineering',
        semester: 7,
      }
    });
  } catch (error) {
    logger.error('🚨 Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile: ' + (error as Error).message
    });
  }
});

export { router as authRoutes };
