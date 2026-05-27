import type { Prisma, User } from '@prisma/client';
import { BaseRepository } from './base.repository';

/**
 * Data access for the User entity. Services depend on this; never on Prisma directly.
 */
export class UserRepository extends BaseRepository {
  /** Find a user by primary key. */
  public findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  /** Find a user by email (lowercased exact match). */
  public findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  /** Insert a new user. Caller is responsible for hashing the password. */
  public create(input: Prisma.UserCreateInput): Promise<User> {
    return this.db.user.create({ data: input });
  }

  /** Patch an existing user. */
  public update(id: string, patch: Prisma.UserUpdateInput): Promise<User> {
    return this.db.user.update({ where: { id }, data: patch });
  }
}
