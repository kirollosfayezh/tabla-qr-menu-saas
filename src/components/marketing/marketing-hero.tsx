import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { TrustMarquee } from './trust-marquee';

/** Hero section: headline + CTAs + social proof + phone mockup + trust bar. */
export async function MarketingHero(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.hero');
  return (
    <section className="bg-gradient-to-b from-[#FFFBF8] to-surface-base pb-20 pt-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-primary-soft px-3 py-1.5 text-xs font-semibold text-brand-primary-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden />
            {t('badge')}
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-text-primary sm:text-6xl lg:text-[4.5rem]">
            {t('h1a')}<br />
            <span className="text-brand-primary">{t('h1b')}</span>
          </h1>

          <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-text-secondary">
            {t('sub')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white shadow-md transition hover:bg-brand-primary-dark hover:shadow-lg active:scale-[0.98]"
            >
              {t('cta1')}
              <ArrowRight />
            </Link>
            <a
              href="#how"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border-default bg-surface-base px-6 text-sm font-semibold text-text-primary transition hover:bg-surface-raised"
            >
              <PlayIcon />
              {t('cta2')}
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex">
              {['A', 'B', 'C', 'D'].map((l, i) => (
                <span
                  key={l}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white font-display text-xs font-bold text-white"
                  style={{ background: `hsl(${[35, 90, 180, 260][i]},65%,60%)`, marginInlineStart: i ? '-8px' : '0' }}
                  aria-hidden
                >
                  {l}
                </span>
              ))}
            </div>
            <div className="text-sm text-text-secondary">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
                <span className="ms-1 font-bold text-text-primary">{t('rating')}</span>
              </div>
              <div className="mt-0.5">{t('reviews')}</div>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute h-80 w-80 rounded-full bg-brand-primary-soft opacity-60 blur-3xl" aria-hidden />
          <PhoneMockup />
          <div className="absolute end-0 top-14 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]">
              <WhatsAppIcon />
            </span>
            <div>
              <p className="text-xs font-bold text-text-primary">New order · Table 12</p>
              <p className="text-[11px] text-text-tertiary">3 items · 280 EGP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t('trustedBy')}</p>
        <TrustMarquee />
      </div>
    </section>
  );
}

function PhoneMockup(): React.JSX.Element {
  return (
    <div className="relative z-10 overflow-hidden rounded-[36px] border-4 border-text-primary/10 bg-white shadow-2xl" style={{ width: 240, height: 500 }}>
      <div className="h-full overflow-hidden bg-[#FFFBF5] px-4 pb-4 pt-10 text-xs">
        <div className="mb-3 text-center">
          <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F4E4C1] font-bold text-[#B8341F]">ن</div>
          <p className="font-bold text-[#2A1810]" style={{ fontFamily: 'Georgia, serif' }}>Cafe Nour</p>
          <p className="text-[9px] uppercase tracking-wider text-[#6B5440]">Levantine kitchen</p>
        </div>
        <div className="mb-2 flex gap-1 overflow-hidden border-y border-[#E8DBC2] py-1.5">
          {['Featured', 'Mezze', 'Mains'].map((c, i) => (
            <span key={c} className="shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-semibold" style={{ background: i === 0 ? '#B8341F' : 'transparent', color: i === 0 ? '#fff' : '#6B5440', border: i === 0 ? 'none' : '1px solid #E8DBC2' }}>{c}</span>
          ))}
        </div>
        {[{ n: 'Shakshuka Nour', p: 95, h: 18 }, { n: 'Hummus Beiruti', p: 55, h: 45 }, { n: 'Lamb Mansaf', p: 180, h: 30 }].map((it) => (
          <div key={it.n} className="flex gap-2 border-b border-[#E8DBC2] py-2">
            <div className="h-11 w-11 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg,hsl(${it.h},65%,80%),hsl(${it.h + 40},70%,72%))` }} />
            <div className="flex-1">
              <p className="font-semibold text-[#2A1810]" style={{ fontFamily: 'Georgia, serif', fontSize: 11 }}>{it.n}</p>
              <p className="mt-0.5 text-[9px] font-bold text-[#B8341F]">{it.p} EGP</p>
            </div>
          </div>
        ))}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-[#B8341F] px-3 py-2 text-[10px] font-bold text-white">
          <span>View cart · 3</span><span>280 EGP</span>
        </div>
      </div>
    </div>
  );
}

function ArrowRight(): React.JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PlayIcon(): React.JSX.Element {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4" /><path d="M6 4.5l4 2.5-4 2.5V4.5z" fill="currentColor" /></svg>;
}

function StarIcon(): React.JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="#F59E0B" aria-hidden><path d="M6 1l1.3 3.9H11L8.4 7l1 3.1L6 8.4 2.6 10.1l1-3.1L1 4.9h3.7z" /></svg>;
}

function WhatsAppIcon(): React.JSX.Element {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9s-.5-.1-.7.1-.7.9-.9 1.1-.3.2-.6 0c-1.7-.8-2.8-1.5-3.9-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-1-2.3c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.9 4.2 2.2.9 2.6.7 3 .6.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7z" /><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z" /></svg>;
}
