'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ADMIN_NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/cn';

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar(): React.JSX.Element {
  const t = useTranslations('admin');
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="px-3 pb-4">
        <Link href="/admin" className="font-display text-xl font-semibold text-text-primary">
          Tabla · Admin
        </Link>
      </div>
      <ul className="flex flex-col gap-0.5">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-brand-primary-soft text-brand-primary-dark'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                )}
              >
                <span>{t(item.i18nKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
