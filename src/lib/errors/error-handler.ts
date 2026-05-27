import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './base.error';
import { InternalServerError, RateLimitError, ValidationError } from './errors';
import { logger } from '../logger';

/**
 * Normalize any thrown value into an AppError, then turn it into a NextResponse.
 * Use at the boundary of every API route handler.
 */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof ZodError) {
    return new ValidationError('Invalid input', { issues: err.flatten() });
  }
  if (err instanceof Error) {
    logger.error({ err }, 'Unhandled error');
    return new InternalServerError();
  }
  logger.error({ err }, 'Non-Error thrown');
  return new InternalServerError();
}

/** Convert any error into a JSON NextResponse with the right status code. */
export function errorResponse(err: unknown): NextResponse {
  const appErr = toAppError(err);
  const headers = new Headers({ 'content-type': 'application/json' });
  if (appErr instanceof RateLimitError) {
    headers.set('retry-after', String(appErr.retryAfterSeconds));
  }
  return NextResponse.json({ error: appErr.toClientJSON() }, {
    status: appErr.httpStatus,
    headers,
  });
}
