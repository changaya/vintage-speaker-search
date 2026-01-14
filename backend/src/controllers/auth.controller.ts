import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { comparePassword } from '../utils/password';
import { generateToken } from '../middleware/auth.middleware';
import { loginSchema } from '@vintage-audio/shared';

/**
 * Login admin user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.errors,
      });
    }

    const { username, password } = validation.data;

    // Find admin user
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during login',
    });
  }
};

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response) => {
  // JWT tokens are stateless, so logout is handled client-side
  // This endpoint is mainly for logging purposes
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Admin user not found',
      });
    }

    res.json(admin);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred',
    });
  }
};
