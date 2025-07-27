import express from 'express';
import { adminProtect } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();

// @desc    Admin dashboard
// @route   GET /api/admin/dashboard
// @access  Admin
router.get('/dashboard', adminProtect, asyncHandler(async (req: express.Request, res: express.Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Admin dashboard data retrieved successfully',
    data: {
      message: 'Admin dashboard endpoint - implementation pending'
    },
    timestamp: new Date(),
  };

  res.json(response);
}));

export { router as adminRoutes };
