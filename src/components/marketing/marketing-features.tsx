import { getTranslations } from 'next-intl/server';

type FeatureIcon = 'qr' | 'palette' | 'whatsapp' | 'card' | 'chart' | 'globe';

interface FeatureItem {
  icon: FeatureIcon;
  title: string;
  desc: string;
}

/** 3×2 features grid matching `qrcode menu/marketing.jsx` Features section. */
export async function MarketingFeatures(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.features');
  const items = t.raw('items') as FeatureItem[];
  return (
    <section id="features" className="bg-surface-base py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">{t('label')}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{t('heading')}</h2>
          <p className="mt-3 text-lg text-text-secondary">{t('sub')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border-subtle bg-surface-raised p-7 transition hover:shadow-md">
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-soft">
                <FeatureIcon name={f.icon} />
              </span>
              <h3 className="font-display text-lg font-bold tracking-tight text-text-primary">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureIcon({ name }: { name: FeatureIcon }): React.JSX.Element {
  const cls = 'text-brand-primary';
  if (name === 'qr') return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="13" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="2" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="4" y="4" width="3" height="3" fill="currentColor"/><rect x="15" y="4" width="3" height="3" fill="currentColor"/><rect x="4" y="15" width="3" height="3" fill="currentColor"/><path d="M13 13h2v2h-2zM17 13h2v2h-2zM13 17h2v2h-2zM17 17h2v2h-2z" fill="currentColor"/></svg>;
  if (name === 'palette') return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><path d="M11 2a9 9 0 1 0 0 18 4 4 0 0 0 0-8 4 4 0 0 1 0-8" stroke="currentColor" strokeWidth="1.6"/><circle cx="7.5" cy="8" r="1.2" fill="currentColor"/><circle cx="11" cy="5.5" r="1.2" fill="currentColor"/><circle cx="14.5" cy="8" r="1.2" fill="currentColor"/></svg>;
  if (name === 'whatsapp') return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><path d="M11 2a9 9 0 0 0-7.7 13.7L2 20l4.4-1.3A9 9 0 1 0 11 2z" stroke="currentColor" strokeWidth="1.6"/><path d="M8.2 7.6c.1-.4.4-.4.6-.4h.5c.2 0 .4.1.5.4l.8 2c.1.2 0 .4 0 .5-.2.5-.5.8-.4 1 .9 1.7 1.9 2.4 3.3 3 .3.1.4 0 .5 0 .2-.2.6-.7.8-.9.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5v.8c0 .3-.2.5-.5.5-4.6.3-7.3-3.4-7.6-4.2-.3-.8-.3-2.5.1-3.9z" fill="currentColor"/></svg>;
  if (name === 'card') return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M2 9h18" stroke="currentColor" strokeWidth="1.6"/><path d="M6 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (name === 'chart') return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><path d="M3 16l5-5 4 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 19h18" stroke="currentColor" strokeWidth="1.4"/></svg>;
  return <svg className={cls} width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/><ellipse cx="11" cy="11" rx="4" ry="9" stroke="currentColor" strokeWidth="1.4"/><path d="M2 11h18" stroke="currentColor" strokeWidth="1.4"/></svg>;
}
