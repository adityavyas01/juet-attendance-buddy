import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  // This will be implemented with actual data fetching
  const response: ApiResponse = {
    success: true,
    message: 'Dashboard data retrieved successfully',
    data: {
      message: 'Student dashboard endpoint - implementation pending'
    },
    timestamp: new Date(),
  };

  res.json(response);
}));

export { router as studentRoutes };
