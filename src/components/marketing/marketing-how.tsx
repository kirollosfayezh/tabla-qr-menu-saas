import { getTranslations } from 'next-intl/server';

interface Step {
  n: string;
  title: string;
  desc: string;
}

/** How it works — 3 steps with dashed connector line. */
export async function MarketingHow(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.how');
  const steps = t.raw('steps') as Step[];
  return (
    <section id="how" className="bg-surface-sunken py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">{t('label')}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{t('heading')}</h2>
          <p className="mt-3 text-lg text-text-secondary">{t('sub')}</p>
        </div>
        <div className="relative grid gap-10 sm:grid-cols-3">
          {/* Dashed connector — hidden on mobile */}
          <div
            className="absolute inset-x-[16%] top-9 hidden h-0.5 sm:block"
            style={{ background: 'repeating-linear-gradient(to right, var(--brand-primary) 0, var(--brand-primary) 6px, transparent 6px, transparent 12px)' }}
            aria-hidden
          />
          {steps.map((step) => (
            <div key={step.n} className="relative text-center">
              <div className="relative z-10 mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-brand-primary bg-surface-base font-display text-2xl font-extrabold text-brand-primary">
                {step.n}
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
