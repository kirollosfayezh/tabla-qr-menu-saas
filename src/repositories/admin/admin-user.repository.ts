import type { Prisma, User, UserRole } from '@prisma/client';
import { BaseRepository } from '../base.repository';

export interface AdminUserFilters {
  search?: string;
  role?: UserRole;
  take: number;
  skip: number;
}

export type AdminUserRow = User & {
  _count: { restaurants: number };
};

export class AdminUserRepository extends BaseRepository {
  public list(filters: AdminUserFilters): Promise<AdminUserRow[]> {
    return this.db.user.findMany({
      where: buildWhere(filters),
      include: { _count: { select: { restaurants: true } } },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
      skip: filters.skip,
    });
  }

  public count(filters: Omit<AdminUserFilters, 'take' | 'skip'>): Promise<number> {
    return this.db.user.count({ where: buildWhere(filters) });
  }

  public setRole(userId: string, role: UserRole): Promise<User> {
    return this.db.user.update({ where: { id: userId }, data: { role } });
  }

  public findById(userId: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id: userId } });
  }
}

function buildWhere(filters: Pick<AdminUserFilters, 'search' | 'role'>): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (filters.role) where.role = filters.role;
  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { email: { contains: term, mode: 'insensitive' } },
      { name: { contains: term, mode: 'insensitive' } },
    ];
  }
  return where;
}
