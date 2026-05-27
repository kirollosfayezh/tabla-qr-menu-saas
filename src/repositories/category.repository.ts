import type { MenuCategory, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

/** Data access for MenuCategory entities. All methods enforce restaurantId. */
export class CategoryRepository extends BaseRepository {
  public listForRestaurant(restaurantId: string): Promise<MenuCategory[]> {
    return this.db.menuCategory.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  public findById(id: string, restaurantId: string): Promise<MenuCategory | null> {
    return this.db.menuCategory.findFirst({ where: { id, restaurantId } });
  }

  public async create(
    restaurantId: string,
    data: Pick<Prisma.MenuCategoryCreateInput, 'name' | 'nameAr'>,
  ): Promise<MenuCategory> {
    const last = await this.db.menuCategory.findFirst({
      where: { restaurantId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;
    return this.db.menuCategory.create({
      data: {
        name: data.name,
        nameAr: data.nameAr ?? null,
        sortOrder,
        restaurant: { connect: { id: restaurantId } },
      },
    });
  }

  public async rename(
    id: string,
    restaurantId: string,
    patch: { name: string; nameAr: string | null },
  ): Promise<MenuCategory> {
    const res = await this.db.menuCategory.updateMany({
      where: { id, restaurantId },
      data: patch,
    });
    if (res.count === 0) throw new Error('Category not found');
    return (await this.findById(id, restaurantId))!;
  }

  public async remove(id: string, restaurantId: string): Promise<void> {
    await this.db.menuCategory.deleteMany({ where: { id, restaurantId } });
  }

  /** Persist a new order. Caller must pass the full list of category ids. */
  public async reorder(restaurantId: string, ids: ReadonlyArray<string>): Promise<void> {
    await this.db.$transaction(
      ids.map((id, idx) =>
        this.db.menuCategory.updateMany({
          where: { id, restaurantId },
          data: { sortOrder: idx },
        }),
      ),
    );
  }
}
