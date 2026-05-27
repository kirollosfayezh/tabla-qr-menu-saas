'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NAV_ITEMS } from './nav-items';
import { NavIcon } from './nav-icon';
import { cn } from '@/lib/cn';

interface SidebarProps {
  /** Used by the mobile drawer to close itself on navigation. */
  onNavigate?: () => void;
}

/** Vertical navigation rail for the owner dashboard. */
export function Sidebar({ onNavigate }: SidebarProps): React.JSX.Element {
  const t = useTranslations('owner');
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col gap-1 p-3">
      <div className="px-3 pb-4">
        <Link href="/" className="font-display text-xl font-semibold text-text-primary">
          Tabla
        </Link>
      </div>
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-brand-primary-soft text-brand-primary-dark'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary',
                )}
              >
                <NavIcon name={item.iconKey} />
                <span>{t(item.i18nKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
