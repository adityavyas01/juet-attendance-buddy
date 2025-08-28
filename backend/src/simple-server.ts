import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { WebKioskScraper } from './services/webkioskScraper';

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// WebKiosk login endpoint
app.post('/api/auth/webkiosk-login', async (req, res) => {
  try {
    const { enrollmentNumber, password, dateOfBirth } = req.body;

    if (!enrollmentNumber || !password || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: enrollmentNumber, password, dateOfBirth'
      });
    }

    console.log('🔐 Attempting WebKiosk login for:', enrollmentNumber);

    // Call WebKiosk scraper
    const scraper = new WebKioskScraper();
    
    try {
      // Initialize the scraper
      await scraper.initialize();
      
      // Login to WebKiosk
      const loginSuccess = await scraper.login({
        enrollmentNumber,
        dateOfBirth,
        password
      });

      if (!loginSuccess) {
        await scraper.cleanup();
        return res.status(401).json({
          success: false,
          message: 'Failed to authenticate with WebKiosk. Please check your credentials.'
        });
      }

      console.log('✅ WebKiosk login successful for:', enrollmentNumber);

      // Scrape attendance data
      const attendanceResult = await scraper.scrapeAttendance();
      
      // Scrape SGPA data
      const sgpaData = await scraper.scrapeSGPACGPA();

      // Transform attendance data to match API format
      const attendanceTransformed = attendanceResult.subjects.map(subject => ({
        name: subject.name,
        code: subject.code || subject.subjectId,
        lecturePercentage: subject.percentage || 0,
        tutorialPercentage: subject.percentage || 0,
        practicalPercentage: null,
        totalPercentage: subject.percentage || 0
      }));

      // Transform SGPA data to match API format
      const sgpaTransformed = sgpaData.map(semester => ({
        semester: semester.semester,
        sgpa: semester.sgpa,
        cgpa: semester.cgpa
      }));

      // Simple token generation (for testing)
      const token = `test-token-${enrollmentNumber}-${Date.now()}`;

      // Cleanup scraper
      await scraper.cleanup();

      res.json({
        success: true,
        data: {
          token,
          user: {
            enrollmentNumber,
            name: attendanceResult.studentInfo?.name || 'Student Name',
            course: attendanceResult.studentInfo?.course || 'B.T.(CSE)',
            branch: 'CSE',
            semester: attendanceResult.studentInfo?.currentSemester || 7
          },
          attendance: attendanceTransformed,
          sgpa: sgpaTransformed
        }
      });

    } catch (scraperError) {
      await scraper.cleanup();
      throw scraperError;
    }

  } catch (error) {
    console.error('❌ WebKiosk login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Regular login endpoint (simple)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { enrollmentNumber, password } = req.body;

    if (!enrollmentNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: enrollmentNumber, password'
      });
    }

    // Simple token for testing
    const token = `test-token-${enrollmentNumber}-${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        enrollmentNumber,
        name: 'Test User',
        course: 'B.T.(CSE)',
        semester: 7
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
  console.log(`📱 Network access: http://192.168.74.230:${PORT}`);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
});

export default app;
