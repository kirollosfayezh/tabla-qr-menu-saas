import Link from 'next/link';

interface LiveBannerProps {
  menuUrl: string;
  title: string;
  liveLabel: string;
  liveAtLabel: string;
  downloadQr: string;
  preview: string;
  active: boolean;
}

/**
 * Hero banner from `qrcode menu/owner.jsx`: gradient card with LIVE pill, public menu URL,
 * download-QR + preview-menu actions. Status is colored differently when not yet ACTIVE.
 */
export function LiveBanner({
  menuUrl,
  title,
  liveLabel,
  liveAtLabel,
  downloadQr,
  preview,
  active,
}: LiveBannerProps): React.JSX.Element {
  const gradient = active
    ? 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-dark) 100%)'
    : 'linear-gradient(135deg, var(--brand-accent) 0%, var(--brand-accent-soft) 100%)';
  return (
    <section
      className="relative flex flex-wrap items-center gap-6 overflow-hidden rounded-2xl p-6 text-white"
      style={{ background: gradient }}
    >
      <span className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10" aria-hidden />
      <div className="relative z-10 min-w-0 flex-1">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0BFF7D] ring-2 ring-[#0BFF7D]/30" aria-hidden />
          {liveLabel}
        </span>
        <h2 className="mt-2.5 font-display text-xl font-bold sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-white/80">{liveAtLabel}</p>
        <code className="mt-1 block truncate font-mono text-sm text-white/95">{menuUrl}</code>
      </div>
      <div className="relative z-10 flex gap-2">
        <Link
          href="/dashboard/qr"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 text-sm font-semibold hover:bg-white/25"
        >
          {downloadQr}
        </Link>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-brand-primary-dark hover:bg-white/95"
        >
          {preview}
        </a>
      </div>
    </section>
  );
}
