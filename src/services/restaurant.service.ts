import type { Restaurant } from '@prisma/client';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/errors/errors';
import { RESERVED_SUBDOMAINS } from '@/config/constants';
import type { CreateRestaurantDTO, UpdateBrandingDTO, UpdateSettingsDTO } from '@/dtos/restaurant.dto';

export interface SlugCheck {
  available: boolean;
  reason: 'ok' | 'reserved' | 'taken';
}

/**
 * Restaurant domain service.
 * Owns the rules for creating an owner's first restaurant and slug uniqueness.
 */
export class RestaurantService {
  constructor(
    private readonly restaurants: RestaurantRepository = new RestaurantRepository(),
    private readonly themes: ThemeRepository = new ThemeRepository(),
  ) {}

  /** Cheap pre-flight slug availability check used by the wizard as the user types. */
  public async checkSlug(slug: string): Promise<SlugCheck> {
    if (RESERVED_SUBDOMAINS.has(slug)) {
      return { available: false, reason: 'reserved' };
    }
    const taken = await this.restaurants.slugExists(slug);
    return taken ? { available: false, reason: 'taken' } : { available: true, reason: 'ok' };
  }

  /**
   * Create the owner's restaurant.
   * - Enforces single-restaurant-per-owner (MVP).
   * - Re-checks slug uniqueness inside the same call to avoid a TOCTOU race.
   * - Free theme → status ACTIVE + publishedAt now. Paid → PENDING_PAYMENT.
   */
  public async createForUser(ownerId: string, input: CreateRestaurantDTO): Promise<Restaurant> {
    const existing = await this.restaurants.findByOwnerId(ownerId);
    if (existing) {
      throw new ConflictError('You already have a restaurant', { restaurantId: existing.id });
    }

    const theme = await this.themes.findById(input.themeId);
    if (!theme || !theme.isActive) throw new NotFoundError('Theme');

    const check = await this.checkSlug(input.slug);
    if (!check.available) {
      throw check.reason === 'reserved'
        ? new ValidationError('Slug is reserved')
        : new ConflictError('Slug is already taken');
    }

    const isFree = theme.isFree;
    return this.restaurants.create({
      slug: input.slug,
      subdomain: input.slug,
      name: input.name,
      nameAr: emptyToNull(input.nameAr),
      description: emptyToNull(input.description),
      descriptionAr: emptyToNull(input.descriptionAr),
      whatsappNumber: input.whatsappNumber,
      defaultLocale: input.defaultLocale,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      currencyCode: input.currencyCode,
      status: isFree ? 'ACTIVE' : 'PENDING_PAYMENT',
      publishedAt: isFree ? new Date() : null,
      owner: { connect: { id: ownerId } },
      theme: { connect: { id: theme.id } },
    });
  }

  /** Update branding fields (name, tagline, logo, colors). */
  public async updateBranding(restaurantId: string, input: UpdateBrandingDTO): Promise<Restaurant> {
    return this.restaurants.update(restaurantId, {
      name: input.name,
      nameAr: emptyToNull(input.nameAr),
      description: emptyToNull(input.description),
      descriptionAr: emptyToNull(input.descriptionAr),
      logoUrl: emptyToNull(input.logoUrl),
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      accentColor: input.accentColor,
      heroImageUrls: input.heroPhotos.map((p) => p.url),
      heroPhotos: input.heroPhotos,
      heroLayout: input.heroLayout,
      heroImageScale: input.heroImageScale,
    });
  }

  /** Update general settings (WhatsApp, currency, locale, tax, service). */
  public async updateSettings(restaurantId: string, input: UpdateSettingsDTO): Promise<Restaurant> {
    return this.restaurants.update(restaurantId, {
      whatsappNumber: input.whatsappNumber,
      currencyCode: input.currencyCode,
      defaultLocale: input.defaultLocale,
      taxPercent: input.taxPercent,
      serviceChargePercent: input.serviceChargePercent,
    });
  }
}

function emptyToNull(v: string | undefined | null): string | null {
  const trimmed = (v ?? '').trim();
  return trimmed.length === 0 ? null : trimmed;
}
