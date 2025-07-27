import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = express.Router();

// @desc    Trigger manual sync
// @route   POST /api/sync/manual
// @access  Private
router.post('/manual', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Manual sync triggered successfully',
    data: {
      message: 'Sync endpoint - implementation pending'
    },
    timestamp: new Date(),
  };

  res.json(response);
}));

export { router as syncRoutes };
