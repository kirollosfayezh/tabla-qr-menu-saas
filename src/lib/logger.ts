import pino from 'pino';
import { env } from '@/config/env';

/**
 * Process-wide structured logger.
 * Use everywhere instead of console.* — pino in production, pretty in dev.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development'
    ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
    : {}),
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'authorization',
      '*.password',
      '*.passwordHash',
      '*.token',
      'headers.authorization',
      'headers.cookie',
    ],
    censor: '[REDACTED]',
  },
});
