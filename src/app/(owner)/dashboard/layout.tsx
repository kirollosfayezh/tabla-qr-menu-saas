import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import type { User } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { UserRepository } from '@/repositories/user.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { Sidebar } from '@/components/owner/sidebar';
import { Topbar } from '@/components/owner/topbar';

interface TopbarDisplay {
  name: string;
  email: string;
  image: string | null;
}

function firstNonEmpty(...candidates: ReadonlyArray<string | null | undefined>): string {
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return '';
}

function buildTopbarDisplay(user: User | null, session: Session): TopbarDisplay {
  const sessionUser = session.user;
  return {
    name: firstNonEmpty(user?.name, sessionUser?.name, sessionUser?.email, 'Owner'),
    email: firstNonEmpty(user?.email, sessionUser?.email),
    image: user?.image ?? null,
  };
}

/**
 * Server-side auth guard for the entire owner dashboard.
 * - Not signed in → /login
 * - Signed in but no restaurant yet → /onboarding
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const restaurant = await new RestaurantRepository().findByOwnerId(session.user.id);
  if (!restaurant) redirect('/onboarding');

  const user = await new UserRepository().findById(session.user.id);
  const display = buildTopbarDisplay(user, session);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--surface-sunken, #f4f4f6)' }}
    >
      <aside
        className="hidden w-64 shrink-0 border-e border-border-subtle lg:block"
        style={{ backgroundColor: 'var(--surface-base, #ffffff)' }}
      >
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={display} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
