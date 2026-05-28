import type { User } from '@prisma/client';
import { UserRepository } from '@/repositories/user.repository';
import { hashPassword } from '@/lib/auth/password';
import { ConflictError } from '@/lib/errors/errors';
import { logger } from '@/lib/logger';
import { getMessaging } from '@/integrations/messaging/messaging.factory';
import { welcomeEmail } from './email-templates';
import type { SignUpDTO } from '@/dtos/auth.dto';

/**
 * Auth domain service.
 * Wraps user-creation business rules; transport (Turnstile, rate limit) is enforced
 * by the calling server action.
 */
export class AuthService {
  constructor(private readonly users: UserRepository = new UserRepository()) {}

  /**
   * Register a new owner using email + password.
   * Throws ConflictError if the email is already registered.
   */
  public async registerWithEmail(input: SignUpDTO): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already registered', { email: input.email });

    const passwordHash = await hashPassword(input.password);
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: 'OWNER',
    });
    await this.sendWelcomeSafe(user).catch((err) => logger.warn({ err }, 'welcome email failed'));
    return user;
  }

  private async sendWelcomeSafe(user: User): Promise<void> {
    const locale: 'en' | 'ar' = user.localePreference === 'ar' ? 'ar' : 'en';
    const template = welcomeEmail({ locale, name: user.name ?? user.email });
    await getMessaging().sendEmail({
      to: { email: user.email, name: user.name ?? undefined },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}
