import { AppError } from './base.error';

/** 404 — resource not found. */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, unknown>) {
    super(`${resource} not found`, 404, 'NOT_FOUND', context);
  }
}

/** 400 — input validation failed. */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', context);
  }
}

/** 401 — not authenticated. */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 — authenticated but not allowed. */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 409 — conflict (e.g., slug taken). */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', context);
  }
}

/** 429 — rate limit exceeded. */
export class RateLimitError extends AppError {
  public readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number) {
    super('Too many requests', 429, 'RATE_LIMITED', { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

/** 402 — payment required / failed. */
export class PaymentError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 402, 'PAYMENT_ERROR', context);
  }
}

/** 500 — diner theme key not registered. Caller should fall back. */
export class ThemeNotFoundError extends AppError {
  constructor(themeKey: string) {
    super(`Theme not registered: ${themeKey}`, 500, 'THEME_NOT_FOUND', { themeKey });
  }
}

/** 500 — generic server error wrapper for unknown causes. */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
