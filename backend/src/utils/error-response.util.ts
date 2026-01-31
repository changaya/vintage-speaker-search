import { Response } from 'express';

const isDevelopment = process.env.NODE_ENV === 'development';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'DUPLICATE_ENTRY'
  | 'INVALID_REFERENCE'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    details?: any;
  };
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      ...(details && isDevelopment ? { details } : {}),
    },
  };
}

/**
 * Sends an error response with appropriate status code
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: any
): Response {
  return res.status(statusCode).json(createErrorResponse(code, message, details));
}

/**
 * Handles common Prisma errors and sends appropriate responses
 */
export function handlePrismaError(
  res: Response,
  error: any,
  modelName: string
): Response {
  const errorCode = error.code;

  // Record not found
  if (errorCode === 'P2025') {
    return sendError(res, 404, 'NOT_FOUND', `${modelName} not found`);
  }

  // Unique constraint violation
  if (errorCode === 'P2002') {
    const fields = error.meta?.target?.join(', ') || 'fields';
    return sendError(
      res,
      409,
      'DUPLICATE_ENTRY',
      `${modelName} with this ${fields} already exists`
    );
  }

  // Foreign key constraint violation
  if (errorCode === 'P2003') {
    const field = error.meta?.field_name || 'reference';
    return sendError(res, 400, 'INVALID_REFERENCE', `Invalid ${field}`);
  }

  // Generic internal error
  console.error(`${modelName} operation error:`, {
    message: error.message,
    code: errorCode,
    stack: isDevelopment ? error.stack : undefined,
  });

  return sendError(
    res,
    500,
    'INTERNAL_ERROR',
    isDevelopment ? `Failed to process ${modelName}: ${error.message}` : `Failed to process ${modelName}`
  );
}

/**
 * Sends a validation error response
 */
export function sendValidationError(
  res: Response,
  errors: any[],
  message = 'Validation failed'
): Response {
  return sendError(res, 400, 'VALIDATION_ERROR', message, errors);
}

/**
 * Sends a not found error response
 */
export function sendNotFound(res: Response, modelName: string): Response {
  return sendError(res, 404, 'NOT_FOUND', `${modelName} not found`);
}

/**
 * Sends a success response
 */
export function sendSuccess<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json(data);
}

/**
 * Sends a delete success response
 */
export function sendDeleteSuccess(res: Response, modelName: string): Response {
  return res.json({
    success: true,
    message: `${modelName} deleted successfully`,
  });
}
