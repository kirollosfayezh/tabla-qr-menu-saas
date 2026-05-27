/**
 * Base class for all application errors.
 * Carries an HTTP status, machine-readable code, and optional context.
 */
export abstract class AppError extends Error {
  public readonly httpStatus: number;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean = true;

  constructor(
    message: string,
    httpStatus: number,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = httpStatus;
    this.code = code;
    this.context = context;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /** Safe JSON form for client responses (no stack, no internals). */
  public toClientJSON(): { code: string; message: string } {
    return { code: this.code, message: this.message };
  }
}
