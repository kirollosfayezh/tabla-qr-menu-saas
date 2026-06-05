import { auth } from '@/lib/auth/auth';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors/errors';

export interface OwnerContext {
  userId: string;
  restaurantId: string;
  slug: string;
  currencyCode: string;
  defaultLocale: 'en' | 'ar';
}

/**
 * Resolve the active owner's restaurant from the session.
 * Throws UnauthorizedError if no session, ForbiddenError if the owner has no restaurant.
 * Use this at the top of any owner mutation/action — never trust restaurantId from the client.
 */
export async function requireOwnerRestaurant(): Promise<OwnerContext> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const restaurant = await new RestaurantRepository().findByOwnerId(session.user.id);
  if (!restaurant) throw new ForbiddenError('No restaurant for this account');
  return {
    userId: session.user.id,
    restaurantId: restaurant.id,
    slug: restaurant.slug,
    currencyCode: restaurant.currencyCode,
    defaultLocale: restaurant.defaultLocale,
  };
}
