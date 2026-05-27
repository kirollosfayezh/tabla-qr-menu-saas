import type { PrismaClient } from '@prisma/client';
import { prisma } from './prisma.client';

/**
 * Abstract base for all repositories.
 * Concrete repos receive the Prisma client via DI (constructor) for testability,
 * but default to the shared singleton in production.
 */
export abstract class BaseRepository {
  protected readonly db: PrismaClient;
  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }
}
