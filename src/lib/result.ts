import type { AppError } from './errors/base.error';

/** Discriminated-union Result type for service returns where failure is expected. */
export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Construct a success result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Construct a failure result. */
export function fail<E extends AppError>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Unwrap a Result or throw its error — use at the boundary, never inside services. */
export function unwrap<T, E extends AppError>(r: Result<T, E>): T {
  if (r.ok) return r.value;
  throw r.error;
}
