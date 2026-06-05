import { getTranslations } from 'next-intl/server';
import { signOutAction } from '@/app/actions/sign-out.action';
import { UpgradePlanGrid } from '@/app/(owner)/dashboard/billing/upgrade/upgrade-plan-grid';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { toMethodIds } from '@/lib/payments/payment-methods';
import type { AdminPlanRow } from '@/repositories/admin/admin-plan.repository';

interface Props {
  plans: AdminPlanRow[];
  currentPlanKey: string;
  currentMonthlyPriceCents: number;
  currencyCode: string;
}

/**
 * Full-screen lock shown once a free trial expires. Replaces the entire dashboard
 * (no sidebar/topbar) so the only paths forward are paying for a plan — which clears
 * the trial via the Paymob webhook — or signing out.
 */
export async function TrialEndedGate({
  plans,
  currentPlanKey,
  currentMonthlyPriceCents,
  currencyCode,
}: Props): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.trialEnded');
  const activePaymentMethods = await new PaymentMethodRepository().listActiveKeys();

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-10" style={{ backgroundColor: 'var(--surface-sunken, #f4f4f6)' }}>
      <div className="w-full max-w-4xl space-y-8">
        <header className="space-y-3 text-center">
          <h1 className="font-display text-3xl font-extrabold text-text-primary">{t('title')}</h1>
          <p className="mx-auto max-w-2xl text-sm text-text-secondary">{t('description')}</p>
        </header>

        <UpgradePlanGrid
          plans={plans}
          currentPlanKey={currentPlanKey}
          currentMonthlyPriceCents={currentMonthlyPriceCents}
          currencyCode={currencyCode}
          activePaymentMethods={toMethodIds(activePaymentMethods)}
        />

        <form action={signOutAction} className="text-center">
          <button type="submit" className="text-sm font-semibold text-text-tertiary underline-offset-4 hover:underline">
            {t('signOut')}
          </button>
        </form>
      </div>
    </div>
  );
}
