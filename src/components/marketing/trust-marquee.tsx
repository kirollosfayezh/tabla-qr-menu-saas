'use client';

import { useLocale } from 'next-intl';

/**
 * Infinite scrolling trust bar.
 *
 * Direction logic:
 *  - LTR (English): track moves LEFT  → translateX(0 → -50%)
 *  - RTL (Arabic):  track moves RIGHT → translateX(0 →  50%)
 *    Achieved via `animation-direction: reverse` in CSS when dir=rtl.
 *
 * The track is duplicated (12 items = 6 × 2) so when the first copy
 * exits one edge, the second copy is already filling in from the other —
 * creating a seamless infinite loop with no jump.
 *
 * Fade masks are direction-aware: the entry side fades from the
 * background colour to transparent, exit side does the reverse.
 * In RTL the sides swap, so we conditionally flip the gradient direction.
 */

const TRUST_NAMES = [
  'Bayt Al‑Mandi',
  'Olive & Thyme',
  'Cafe Nour',
  'SUMAQ',
  'Maison Beirut',
  'FRESHA',
] as const;

const BG = '#FFFBF8';

export function TrustMarquee(): React.JSX.Element {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const items = [...TRUST_NAMES, ...TRUST_NAMES];

  return (
    <div className="relative overflow-hidden" aria-hidden>
      {/* Entry-side fade (left in LTR, right in RTL) */}
      <div
        className="pointer-events-none absolute inset-y-0 start-0 z-10 w-24"
        style={{
          background: isRtl
            ? `linear-gradient(to left, ${BG}, transparent)`
            : `linear-gradient(to right, ${BG}, transparent)`,
        }}
      />
      {/* Exit-side fade (right in LTR, left in RTL) */}
      <div
        className="pointer-events-none absolute inset-y-0 end-0 z-10 w-24"
        style={{
          background: isRtl
            ? `linear-gradient(to right, ${BG}, transparent)`
            : `linear-gradient(to left, ${BG}, transparent)`,
        }}
      />

      <div
        className="marquee-track opacity-50"
        style={isRtl ? { animationDirection: 'reverse' } : undefined}
      >
        {items.map((name, index) => (
          <span key={index} className="mx-10 font-display text-lg font-bold text-text-secondary">
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
