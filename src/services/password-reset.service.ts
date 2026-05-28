import { createHash, randomBytes } from 'crypto';
import { UserRepository } from '@/repositories/user.repository';
import { PasswordResetTokenRepository } from '@/repositories/password-reset-token.repository';
import { hashPassword } from '@/lib/auth/password';
import { ValidationError } from '@/lib/errors/errors';
import { getMessaging } from '@/integrations/messaging/messaging.factory';
import { resetPasswordEmail } from './email-templates';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

const TOKEN_BYTES = 32;
export const RESET_EXPIRES_MINUTES = 30;

interface RequestArgs {
  email: string;
  locale: 'en' | 'ar';
}

interface ConsumeArgs {
  token: string;
  newPassword: string;
}

/**
 * Password reset flow.
 * - request(): always returns success-shape to avoid user enumeration; only sends if the
 *   email matches a real user with a passwordHash (i.e., not Google-only).
 * - consume(): single-use, time-bounded; on success rotates the password and invalidates
 *   all other reset tokens for that user.
 */
export class PasswordResetService {
  constructor(
    private readonly users: UserRepository = new UserRepository(),
    private readonly tokens: PasswordResetTokenRepository = new PasswordResetTokenRepository(),
  ) {}

  public async request(args: RequestArgs): Promise<void> {
    const user = await this.users.findByEmail(args.email);
    if (!user || !user.passwordHash) {
      logger.info({ email: args.email }, 'password reset requested for unknown or oauth-only account');
      return;
    }
    const rawToken = randomBytes(TOKEN_BYTES).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_EXPIRES_MINUTES * 60_000);
    await this.tokens.deleteExpiredForUser(user.id);
    await this.tokens.insert({ userId: user.id, tokenHash, expiresAt });
    const url = `${env.APP_PUBLIC_URL.replace(/\/$/, '')}/reset-password/${rawToken}`;
    const template = resetPasswordEmail({ url, locale: args.locale, expiresInMinutes: RESET_EXPIRES_MINUTES });
    await getMessaging().sendEmail({
      to: { email: user.email, name: user.name ?? undefined },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  public async consume(args: ConsumeArgs): Promise<void> {
    if (args.newPassword.length < 8) throw new ValidationError('Password must be at least 8 characters');
    const tokenHash = hashToken(args.token);
    const row = await this.tokens.findByTokenHash(tokenHash);
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new ValidationError('Reset link is invalid or expired');
    }
    const passwordHash = await hashPassword(args.newPassword);
    await this.users.update(row.userId, { passwordHash });
    await this.tokens.markUsed(row.id);
    await this.tokens.deleteExpiredForUser(row.userId);
  }
}

function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
