import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import env from '../config/env';

export interface FormattedError {
  field?: string;
  message: string;
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: FormattedError[] = err.errors.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // 2. Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // 3. Handle PostgreSQL Unique Constraint Violation (error code 23505)
  if (err.code === '23505') {
    let message = 'A record with these details already exists';
    if (err.detail && err.detail.includes('email')) {
      message = 'Email is already registered';
    } else if (err.detail && err.detail.includes('phone')) {
      message = 'Phone number is already registered';
    }

    res.status(409).json({
      success: false,
      message,
    });
    return;
  }

  // 4. Handle JSON parse syntax error from body-parser
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided in request body',
    });
    return;
  }

  // 5. Unhandled / Internal Server Error
  console.error('[Unhandled Error]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
