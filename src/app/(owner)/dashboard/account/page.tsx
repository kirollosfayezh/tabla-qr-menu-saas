import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { auth } from '@/lib/auth/auth';
import { signOutAction } from '@/app/actions/sign-out.action';
import { UnauthorizedError } from '@/lib/errors/errors';

export const metadata = { title: 'Account · Tabla' };

export default async function AccountPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.account');
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  const user = session.user;
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <section className="max-w-2xl rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm sm:p-7">
        <dl className="divide-y divide-border-subtle">
          <Row label={t('name')} value={user.name ?? '—'} />
          <Row label={t('email')} value={user.email ?? '—'} />
          <Row label={t('role')} value={user.role ?? 'OWNER'} />
        </dl>
        <form action={signOutAction} className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full border border-border-default bg-surface-base px-5 text-sm font-semibold text-text-primary transition hover:bg-surface-raised"
          >
            {t('signOut')}
          </button>
        </form>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="text-sm text-text-tertiary">{label}</dt>
      <dd className="text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}
