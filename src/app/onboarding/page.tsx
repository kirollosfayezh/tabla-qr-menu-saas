import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { env } from '@/config/env';
import { Wizard } from './wizard/wizard';
import { toThemeOption } from './wizard/types';

export const metadata = { title: 'Onboarding · Tabla' };

/**
 * Onboarding entry point.
 * - Unauthenticated → /login
 * - Already has a restaurant → /dashboard
 * - Otherwise render the wizard with theme options + root domain for the live preview.
 */
export default async function OnboardingPage(): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const restaurants = new RestaurantRepository();
  const existing = await restaurants.findByOwnerId(session.user.id);
  if (existing) redirect('/dashboard');

  const themes = (await new ThemeRepository().listActive()).map(toThemeOption);

  return (
    <main className="min-h-screen bg-surface-sunken">
      <Wizard themes={themes} rootDomain={env.APP_ROOT_DOMAIN} />
    </main>
  );
}
