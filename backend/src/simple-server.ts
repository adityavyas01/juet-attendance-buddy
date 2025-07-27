import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ 
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' 
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JUET Attendance Backend is running',
    timestamp: new Date().toISOString() 
  });
});

// Mock auth endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { enrollmentNumber, password } = req.body;
  
  // Mock authentication - replace with real implementation
  if (enrollmentNumber && password) {
    const mockUser = {
      id: '1',
      enrollmentNumber,
      name: 'Test Student',
      course: 'B.Tech (CSE)',
      branch: 'Computer Science & Engineering',
      semester: 7,
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    res.json({
      success: true,
      data: {
        user: mockUser,
        token: mockToken
      },
      message: 'Login successful'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/profile', (req, res) => {
  // Mock profile endpoint
  const mockUser = {
    id: '1',
    enrollmentNumber: '20BCS101',
    name: 'Test Student',
    course: 'B.Tech (CSE)',
    branch: 'Computer Science & Engineering',
    semester: 7,
  };

  res.json({
    success: true,
    data: mockUser
  });
});

// Mock sync endpoint
app.post('/api/sync/manual', (req, res) => {
  // Simulate sync process
  setTimeout(() => {
    res.json({
      success: true,
      data: { message: 'Manual sync completed successfully' }
    });
  }, 1000);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
