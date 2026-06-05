import type { Prisma } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { PaymentService } from '@/services/payment.service';
import { NotFoundError } from '@/lib/errors/errors';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';

export interface SelectThemeInput {
  userId: string;
  restaurantId: string;
  email: string;
  themeKey: string;
  override: ThemeOverrideDto;
  method: 'card' | 'applePay';
}

/** Discriminated outcome: either the theme is now live, or payment is required. */
export interface SelectThemeOutcome {
  activated: boolean;
  redirectUrl: string | null;
}

/**
 * Owns "choose a theme" business rules: entitlement (free / plan-granted /
 * already-purchased) gates instant activation; anything else routes through
 * paid checkout. Customizer overrides are persisted only when the theme is
 * actually activated, so a tenant's saved look always matches its live theme.
 */
export class ThemeService {
  constructor(
    private readonly restaurants: RestaurantRepository = new RestaurantRepository(),
    private readonly themes: ThemeRepository = new ThemeRepository(),
    private readonly plans: PlanRepository = new PlanRepository(),
    private readonly payments: PaymentRepository = new PaymentRepository(),
    private readonly paymentService: PaymentService = new PaymentService(),
  ) {}

  public async selectTheme(input: SelectThemeInput): Promise<SelectThemeOutcome> {
    const restaurant = await this.restaurants.findById(input.restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    const theme = await this.themes.findByKey(input.themeKey);
    if (!theme || !theme.isActive) throw new NotFoundError('Theme');

    if (await this.isEntitled(restaurant.planKey, restaurant.id, theme.id, theme.isFree || theme.priceCents === 0)) {
      const status = restaurant.status === 'PENDING_PAYMENT' ? 'ACTIVE' : restaurant.status;
      const publishedAt = restaurant.publishedAt ?? (status === 'ACTIVE' ? new Date() : null);
      await this.restaurants.saveActiveTheme(input.restaurantId, theme.id, input.override as Prisma.InputJsonValue, status, publishedAt);
      return { activated: true, redirectUrl: null };
    }

    const checkout = await this.paymentService.checkoutTheme({
      userId: input.userId,
      restaurantId: input.restaurantId,
      themeId: theme.id,
      email: input.email,
      method: input.method,
    });
    return { activated: checkout.paid, redirectUrl: checkout.redirectUrl };
  }

  private async isEntitled(planKey: string, restaurantId: string, themeId: string, free: boolean): Promise<boolean> {
    if (free) return true;
    if (await this.plans.themeAllowed(planKey, themeId)) return true;
    return this.payments.hasSuccessfulThemePayment(restaurantId, themeId);
  }
}
