import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const LOCAL_DEV_SECRET = process.env.LOCAL_DEV_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: string;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  username: string;
  role: string;
}

/**
 * Check if request has valid dev secret for local bypass
 */
const checkDevSecret = (req: Request): boolean => {
  if (NODE_ENV !== 'development' || !LOCAL_DEV_SECRET) {
    return false;
  }
  const devSecret = req.headers['x-dev-secret'];
  return devSecret === LOCAL_DEV_SECRET;
};

/**
 * Middleware to verify JWT token and attach user to request
 * In development mode, allows bypass with X-Dev-Secret header
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for dev secret bypass (development only)
  if (checkDevSecret(req)) {
    req.user = {
      id: 'dev-user',
      username: 'developer',
      role: 'admin'
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
  }

  next();
};

/**
 * Generate JWT token for user
 */
export const generateToken = (payload: JWTPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};
