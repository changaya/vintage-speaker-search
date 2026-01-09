import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';

// Standard error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

// Error middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', err);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
      },
    };

    // In development, include detailed validation errors
    if (isDevelopment) {
      response.error.details = err.errors.map((error) => ({
        path: error.path.join('.'),
        message: error.message,
        code: error.code,
      }));
    } else {
      // In production, provide user-friendly message
      const firstError = err.errors[0];
      if (firstError) {
        response.error.message = `Invalid ${firstError.path.join('.')}: ${firstError.message}`;
      }
    }

    return res.status(400).json(response);
  }

  // Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Database operation failed',
        code: err.code,
      },
    };

    // Handle specific Prisma error codes
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const target = (err.meta?.target as string[]) || [];
        response.error.message = isDevelopment
          ? `Unique constraint failed on fields: ${target.join(', ')}`
          : 'This record already exists';
        break;

      case 'P2003':
        // Foreign key constraint violation
        response.error.message = isDevelopment
          ? `Foreign key constraint failed on field: ${err.meta?.field_name}`
          : 'Related record not found';
        break;

      case 'P2025':
        // Record not found
        response.error.message = 'Record not found';
        break;

      case 'P2014':
        // Required relation violation
        response.error.message = isDevelopment
          ? `Required relation violation: ${err.meta?.relation_name}`
          : 'Cannot delete record with existing relations';
        break;

      default:
        response.error.message = isDevelopment
          ? `Database error: ${err.message}`
          : 'Database operation failed';
    }

    // In development, include full error details
    if (isDevelopment) {
      response.error.details = {
        code: err.code,
        meta: err.meta,
        clientVersion: err.clientVersion,
      };
    }

    return res.status(400).json(response);
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: isDevelopment ? err.message : 'Invalid data provided',
        code: 'PRISMA_VALIDATION_ERROR',
      },
    };

    if (isDevelopment) {
      response.error.details = {
        stack: err.stack,
      };
    }

    return res.status(400).json(response);
  }

  // JWT Authentication Errors (from jsonwebtoken)
  if (err.name === 'JsonWebTokenError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Invalid authentication token',
        code: 'JWT_INVALID',
      },
    };

    if (isDevelopment) {
      response.error.details = { message: err.message };
    }

    return res.status(401).json(response);
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication token expired',
        code: 'JWT_EXPIRED',
      },
    });
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'File upload failed',
        code: 'UPLOAD_ERROR',
      },
    };

    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      response.error.message = 'File size exceeds limit';
    } else if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
      response.error.message = 'Unexpected file field';
    }

    if (isDevelopment) {
      response.error.details = {
        code: multerErr.code,
        field: multerErr.field,
      };
    }

    return res.status(400).json(response);
  }

  // Generic Error (500 Internal Server Error)
  const response: ErrorResponse = {
    success: false,
    error: {
      message: isDevelopment ? err.message : 'Something went wrong',
      code: 'INTERNAL_SERVER_ERROR',
    },
  };

  // In development, include stack trace
  if (isDevelopment) {
    response.error.details = {
      stack: err.stack,
      name: err.name,
    };
  }

  return res.status(500).json(response);
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response) => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
    },
  };

  if (isDevelopment) {
    response.error.details = {
      method: req.method,
      path: req.path,
      baseUrl: req.baseUrl,
    };
  }

  res.status(404).json(response);
};
