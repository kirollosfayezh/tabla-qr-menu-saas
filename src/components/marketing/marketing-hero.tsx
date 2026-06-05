import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { TrustMarquee } from './trust-marquee';

/**
 * Poster shown before/instead of the video (verified Unsplash food image), so the
 * hero looks finished even when `/public/hero.mp4` is absent.
 */
const HERO_POSTER = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=70';

/** Hero: full-bleed video background (drop a clip at /public/hero.mp4) + headline + CTAs. */
export async function MarketingHero(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.hero');
  return (
    <>
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_POSTER}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
          preload="metadata"
          aria-hidden
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" aria-hidden />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:py-36">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" aria-hidden />
            {t('badge')}
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[4.75rem]">
            {t('h1a')}<br />
            <span className="text-brand-primary">{t('h1b')}</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-white/85">{t('sub')}</p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-primary px-7 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-primary-dark active:scale-[0.98]"
            >
              {t('cta1')}
              <ArrowRight />
            </Link>
            <a
              href="#themes"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/35 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              <PlayIcon />
              {t('cta2')}
            </a>
          </div>

          <SocialProof rating={t('rating')} reviews={t('reviews')} />
        </div>
      </section>

      <section className="bg-surface-base py-12 text-center">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-tertiary">{t('trustedBy')}</p>
        <TrustMarquee />
      </section>
    </>
  );
}

function SocialProof({ rating, reviews }: { rating: string; reviews: string }): React.JSX.Element {
  return (
    <div className="mt-9 flex items-center gap-3 text-white">
      <div className="flex">
        {['A', 'B', 'C', 'D'].map((l, i) => (
          <span
            key={l}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/80 font-display text-xs font-bold text-white"
            style={{ background: `hsl(${[35, 90, 180, 260][i]},65%,55%)`, marginInlineStart: i ? '-8px' : '0' }}
            aria-hidden
          >
            {l}
          </span>
        ))}
      </div>
      <div className="text-sm text-white/85">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
          <span className="ms-1 font-bold text-white">{rating}</span>
        </div>
        <div className="mt-0.5">{reviews}</div>
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
