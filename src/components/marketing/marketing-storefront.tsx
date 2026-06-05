'use client';

// ── Landing storefront — interactive theme gallery + live device preview ────
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ThemeCard } from '@/components/store/theme-card';
import { PreviewModal } from '@/components/store/preview-modal';
import { THEME_ORDER } from '@/components/store/store-data';
import type { ThemeKey } from '@/components/store/store-data';

interface Props {
  label: string;
  heading: string;
  sub: string;
  chooseLabel: string;
}

export function MarketingStorefront({ label, heading, sub, chooseLabel }: Props): React.JSX.Element {
  const router = useRouter();
  const [preview, setPreview] = useState<ThemeKey | null>(null);

  return (
    <section id="themes" className="bg-surface-raised py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* ── Section header ─────────────────────────────── */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">{label}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{heading}</h2>
          <p className="mt-3 text-lg text-text-secondary">{sub}</p>
        </div>

        {/* ── Theme grid — 2 cols mobile, 3 cols desktop ── */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_ORDER.map((key) => (
            <ThemeCard key={key} themeKey={key} isCurrent={false} onPreview={setPreview} />
          ))}
        </div>
      </div>

      {preview && (
        <PreviewModal
          themeKey={preview}
          isCurrent={false}
          saving={false}
          chooseLabel={chooseLabel}
          onClose={() => setPreview(null)}
          onChoose={() => router.push('/signup')}
        />
      )}
    </section>
  );
}
