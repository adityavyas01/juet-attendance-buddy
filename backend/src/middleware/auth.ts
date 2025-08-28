import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { JWTPayload } from '../types';
import { createCustomError } from './errorHandler';

// Export the AuthRequest interface
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      throw createCustomError('Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // For WebKiosk-only auth, we don't need database lookup
      // The token already contains the user information
      req.user = {
        id: decoded.id,
        enrollmentNumber: decoded.enrollmentNumber,
        isAdmin: decoded.isAdmin || false,
      };

      next();
    } catch (error) {
      throw createCustomError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const adminProtect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      throw createCustomError('Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Check if it's an admin token
      if (!decoded.isAdmin) {
        throw createCustomError('Admin access required', 403);
      }

      // Add admin user to request object
      req.user = {
        id: decoded.id,
        enrollmentNumber: decoded.enrollmentNumber,
        isAdmin: true,
      };

      next();
    } catch (error) {
      throw createCustomError('Not authorized to access this route', 401);
    }
  } catch (error) {
    next(error);
  }
};

// Optional auth middleware - doesn't throw error if no token
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        const user = await User.findById(decoded.id).select('-passwordHash');

        if (user && user.isActive) {
          req.user = {
            id: user._id!.toString(),
            enrollmentNumber: user.enrollmentNumber,
            isAdmin: decoded.isAdmin || false,
          };
        }
      } catch (error) {
        // Ignore token errors in optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
