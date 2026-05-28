import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { MobileSidebar } from './mobile-sidebar';
import { UserMenu } from './user-menu';
import { PlanChip } from './plan-chip';
import type { PlanKey } from '@/config/plans';

interface TopbarProps {
  user: { name: string; email: string; image?: string | null };
  planKey: PlanKey;
  planLabel: string;
}

/** Sticky top bar above the dashboard content. */
export function Topbar({ user, planKey, planLabel }: TopbarProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border-subtle bg-surface-base/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface-base/60 sm:px-6">
      <div className="flex items-center gap-2">
        <MobileSidebar />
      </div>
      <div className="flex items-center gap-3">
        <PlanChip planKey={planKey} label={planLabel} />
        <LanguageSwitcher />
        <UserMenu name={user.name} email={user.email} image={user.image} />
      </div>
    </header>
  );
}
