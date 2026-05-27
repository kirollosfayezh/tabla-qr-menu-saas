import type { MenuItem, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import type { CreateItemDTO, UpdateItemDTO } from '@/dtos/menu.dto';

/** Data access for MenuItem entities. All reads/writes are tenant-scoped. */
export class MenuItemRepository extends BaseRepository {
  public listForRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return this.db.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  public listForCategory(restaurantId: string, categoryId: string): Promise<MenuItem[]> {
    return this.db.menuItem.findMany({
      where: { restaurantId, categoryId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  public findById(id: string, restaurantId: string): Promise<MenuItem | null> {
    return this.db.menuItem.findFirst({ where: { id, restaurantId } });
  }

  public async create(
    restaurantId: string,
    currencyCode: string,
    input: CreateItemDTO,
  ): Promise<MenuItem> {
    const last = await this.db.menuItem.findFirst({
      where: { restaurantId, categoryId: input.categoryId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? -1) + 1;
    return this.db.menuItem.create({
      data: this.itemDataFromDto(restaurantId, currencyCode, input, sortOrder),
    });
  }

  public async update(
    restaurantId: string,
    input: UpdateItemDTO,
  ): Promise<MenuItem> {
    const res = await this.db.menuItem.updateMany({
      where: { id: input.id, restaurantId },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        nameAr: input.nameAr || null,
        description: input.description || null,
        descriptionAr: input.descriptionAr || null,
        priceCents: input.priceCents,
        imageUrl: input.imageUrl || null,
        isAvailable: input.isAvailable,
        tags: input.tags,
        allergens: input.allergens,
      },
    });
    if (res.count === 0) throw new Error('Item not found');
    return (await this.findById(input.id, restaurantId))!;
  }

  public async toggleAvailability(
    id: string,
    restaurantId: string,
    isAvailable: boolean,
  ): Promise<void> {
    await this.db.menuItem.updateMany({
      where: { id, restaurantId },
      data: { isAvailable },
    });
  }

  public async remove(id: string, restaurantId: string): Promise<MenuItem | null> {
    const existing = await this.findById(id, restaurantId);
    if (!existing) return null;
    await this.db.menuItem.deleteMany({ where: { id, restaurantId } });
    return existing;
  }

  public async reorderInCategory(
    restaurantId: string,
    categoryId: string,
    ids: ReadonlyArray<string>,
  ): Promise<void> {
    await this.db.$transaction(
      ids.map((id, idx) =>
        this.db.menuItem.updateMany({
          where: { id, restaurantId, categoryId },
          data: { sortOrder: idx },
        }),
      ),
    );
  }

  /** Apply a percent change or absolute price to every item in a category. */
  public async bulkUpdatePrice(
    restaurantId: string,
    categoryId: string,
    mode: 'percent' | 'absolute',
    value: number,
  ): Promise<number> {
    if (mode === 'absolute') {
      const res = await this.db.menuItem.updateMany({
        where: { restaurantId, categoryId },
        data: { priceCents: Math.round(value) },
      });
      return res.count;
    }
    const items = await this.db.menuItem.findMany({
      where: { restaurantId, categoryId },
      select: { id: true, priceCents: true },
    });
    await this.db.$transaction(
      items.map((it) =>
        this.db.menuItem.update({
          where: { id: it.id },
          data: { priceCents: Math.max(0, Math.round(it.priceCents * (1 + value / 100))) },
        }),
      ),
    );
    return items.length;
  }

  private itemDataFromDto(
    restaurantId: string,
    currencyCode: string,
    input: CreateItemDTO,
    sortOrder: number,
  ): Prisma.MenuItemCreateInput {
    return {
      name: input.name,
      nameAr: input.nameAr || null,
      description: input.description || null,
      descriptionAr: input.descriptionAr || null,
      priceCents: input.priceCents,
      currencyCode,
      imageUrl: input.imageUrl || null,
      isAvailable: input.isAvailable,
      tags: input.tags,
      allergens: input.allergens,
      sortOrder,
      restaurant: { connect: { id: restaurantId } },
      category: { connect: { id: input.categoryId } },
    };
  }
}
