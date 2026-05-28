import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { auth } from '@/lib/auth/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--surface-sunken, #f4f4f6)' }}>
      <aside
        className="hidden w-64 shrink-0 border-e border-border-subtle lg:block"
        style={{ backgroundColor: 'var(--surface-base, #ffffff)' }}
      >
        <AdminSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
