import { getTranslations } from 'next-intl/server';

interface ThemeItem {
  name: string;
  desc: string;
}

const THEME_CONFIGS = [
  { bg: '#FFFBF5', headingColor: '#2A1810', textColor: '#6B5440', accent: '#B8341F', itemBg: '#fff', borderColor: '#E8DBC2', hue: 18 },
  { bg: '#FFFFFF', headingColor: '#1A1A1A', textColor: '#6B6B6B', accent: '#FF6B35', itemBg: '#F8F8F8', borderColor: '#ECECEC', hue: 200 },
  { bg: '#0F1419', headingColor: '#C9A961', textColor: '#9C8F6E', accent: '#C9A961', itemBg: '#1A1F26', borderColor: '#2A3038', hue: 38 },
] as const;

/** 3 theme preview cards matching `qrcode menu/marketing.jsx` Themes section. */
export async function MarketingThemes(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.themes');
  const items = t.raw('items') as ThemeItem[];
  return (
    <section id="themes" className="bg-surface-base py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">{t('label')}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{t('heading')}</h2>
          <p className="mt-3 text-lg text-text-secondary">{t('sub')}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((theme, index) => {
            const cfg = THEME_CONFIGS[index]!;
            return (
              <div key={theme.name} className="overflow-hidden rounded-2xl border border-border-subtle" style={{ background: cfg.bg }}>
                <div className="flex items-start justify-between p-5 pb-4">
                  <div>
                    <p className="text-lg font-bold" style={{ color: cfg.headingColor }}>{theme.name}</p>
                    <p className="mt-1 text-xs" style={{ color: cfg.textColor }}>{theme.desc}</p>
                  </div>
                  <span className="mt-0.5 h-6 w-6 rounded-full" style={{ background: cfg.accent }} aria-hidden />
                </div>
                <div className="mx-5 mb-5 overflow-hidden rounded-xl border p-3" style={{ background: cfg.itemBg, borderColor: cfg.borderColor }}>
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="flex gap-2 py-2" style={{ borderBottom: j < 2 ? `1px solid ${cfg.borderColor}` : 'none' }}>
                      <div className="h-9 w-9 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg,hsl(${(cfg.hue + j * 40) % 360},60%,75%),hsl(${(cfg.hue + j * 40 + 30) % 360},65%,68%))` }} />
                      <div className="flex-1 min-w-0">
                        <div className="h-2.5 w-[60%] rounded" style={{ background: cfg.headingColor, opacity: 0.35 }} />
                        <div className="mt-1 h-1.5 w-[40%] rounded" style={{ background: cfg.textColor, opacity: 0.25 }} />
                        <div className="mt-1 h-2 w-[30%] rounded" style={{ background: cfg.accent, opacity: 0.7 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
