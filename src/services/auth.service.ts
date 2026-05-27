import type { User } from '@prisma/client';
import { UserRepository } from '@/repositories/user.repository';
import { hashPassword } from '@/lib/auth/password';
import { ConflictError } from '@/lib/errors/errors';
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
    return this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: 'OWNER',
    });
  }
}
