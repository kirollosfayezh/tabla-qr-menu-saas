import { PublicMenuRepository } from '@/repositories/public-menu.repository';
import type { CategoryWithItems, RestaurantSnapshot } from '@/themes/theme.types';

export interface PublicMenu {
  restaurant: RestaurantSnapshot;
  categories: ReadonlyArray<CategoryWithItems>;
}

/** Diner-side menu resolver. */
export class PublicMenuService {
  constructor(private readonly repo: PublicMenuRepository = new PublicMenuRepository()) {}

  /**
   * Resolve a published menu by slug.
   * Returns null when the slug doesn't exist; the caller decides 404 vs other.
   */
  public findBySlug(slug: string): Promise<PublicMenu | null> {
    return this.repo.findBySlug(slug);
  }
}
