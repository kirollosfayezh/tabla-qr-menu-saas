/* eslint-disable max-lines */

type ThemeKey = 'classic' | 'modern' | 'elegant' | 'market' | 'neon' | 'coastal' | 'street';

interface PreviewPalette {
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSoft: string;
  border: string;
  displayFont: string;
}

const PALETTES: Record<ThemeKey, PreviewPalette> = {
  classic: {
    bg: '#FFFBF5',
    surface: '#FFFFFF',
    primary: '#B8341F',
    secondary: '#F4E4C1',
    text: '#2A1810',
    textSoft: '#6B5440',
    border: '#E8DBC2',
    displayFont: "'Fraunces','Cormorant Garamond',serif",
  },
  modern: {
    bg: '#FFFFFF',
    surface: '#F8F8F8',
    primary: '#1A1A1A',
    secondary: '#FF6B35',
    text: '#0A0A0A',
    textSoft: '#6B6B6B',
    border: '#ECECEC',
    displayFont: "'Bricolage Grotesque','Inter',sans-serif",
  },
  elegant: {
    bg: '#0F1419',
    surface: '#1A1F26',
    primary: '#C9A961',
    secondary: '#1F2937',
    text: '#F5E8C8',
    textSoft: '#9C8F6E',
    border: '#2A3038',
    displayFont: "'Cormorant Garamond','Fraunces',serif",
  },
  market: {
    bg: '#F7FFF4',
    surface: '#FFFFFF',
    primary: '#235D22',
    secondary: '#2DD100',
    text: '#132113',
    textSoft: '#52624E',
    border: '#D8E8D2',
    displayFont: "'Fraunces','Cormorant Garamond',serif",
  },
  neon: {
    bg: '#07080C',
    surface: '#10131B',
    primary: '#28F29C',
    secondary: '#FF2DAA',
    text: '#F7FAFF',
    textSoft: '#9DA6B8',
    border: '#252A38',
    displayFont: "'Bricolage Grotesque','Inter',sans-serif",
  },
  coastal: {
    bg: '#F3FBFF',
    surface: '#FFFFFF',
    primary: '#087C8F',
    secondary: '#7CDDE0',
    text: '#102A34',
    textSoft: '#5B7280',
    border: '#CFE8EE',
    displayFont: "'Bricolage Grotesque','Inter',sans-serif",
  },
  street: {
    bg: '#FFF7E8',
    surface: '#FFFFFF',
    primary: '#D91E18',
    secondary: '#FFD400',
    text: '#111111',
    textSoft: '#57534E',
    border: '#111111',
    displayFont: "'Bricolage Grotesque','Inter',sans-serif",
  },
};

const SAMPLES = [
  { name: 'Shakshuka', desc: 'Slow-cooked tomatoes, eggs', price: '95', hue: 18 },
  { name: 'Hummus', desc: 'Whipped chickpeas, herbs', price: '55', hue: 45 },
  { name: 'Mansaf', desc: 'Tender lamb, jameed yogurt', price: '180', hue: 30 },
];

interface Props {
  themeKey: string;
  height?: number;
}

/**
 * Tiny phone-frame preview rendering a sample menu for a given theme key.
 * No live data — just illustrates layout + typography + palette before purchase.
 */
export function ThemePreview({ themeKey, height = 320 }: Props): React.JSX.Element {
  const palette = PALETTES[(themeKey as ThemeKey) in PALETTES ? (themeKey as ThemeKey) : 'classic'];
  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/5 shadow-inner"
      style={{ backgroundColor: palette.bg, color: palette.text, height, fontFamily: 'var(--f-ui)' }}
    >
      {themeKey === 'modern' ? <ModernPreviewBody palette={palette} /> : null}
      {themeKey === 'elegant' ? <ElegantPreviewBody palette={palette} /> : null}
      {themeKey === 'classic' ? <ClassicPreviewBody palette={palette} /> : null}
      {['market', 'neon', 'coastal', 'street'].includes(themeKey) ? <ShowcasePreviewBody palette={palette} themeKey={themeKey} /> : null}
    </div>
  );
}

function ShowcasePreviewBody({ palette, themeKey }: { palette: PreviewPalette; themeKey: string }): React.JSX.Element {
  const hard = themeKey === 'street';
  const dark = themeKey === 'neon';
  return (
    <div className="flex h-full flex-col p-3">
      <div className="grid grid-cols-[1fr_1.15fr] gap-2">
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: palette.primary }}>
            {themeKey}
          </p>
          <p className="mt-1 text-xl font-black leading-none" style={{ fontFamily: palette.displayFont, color: palette.text }}>Cafe Nour</p>
        </div>
        <div className="relative h-20 overflow-hidden" style={{ borderRadius: hard ? 4 : 16, background: palette.secondary }}>
          <div className="absolute inset-2" style={{ borderRadius: hard ? 3 : 14, background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }} />
          <div className="absolute bottom-2 right-2 h-8 w-8" style={{ borderRadius: 999, background: palette.surface }} />
        </div>
      </div>
      <div className="mt-2 flex gap-1 overflow-hidden">
        {['Best', 'Mains', 'Drinks'].map((c, i) => (
          <span key={c} className="px-2 py-1 text-[8px] font-black uppercase" style={{ borderRadius: 999, background: i === 0 ? palette.primary : palette.surface, color: i === 0 ? (dark ? '#07100c' : '#fff') : palette.textSoft, border: hard ? `1px solid ${palette.border}` : 'none' }}>
            {c}
          </span>
        ))}
      </div>
      <div className={hard ? 'mt-2 flex flex-col gap-2' : 'mt-2 grid flex-1 grid-cols-2 gap-2 overflow-hidden'}>
        {SAMPLES.slice(0, hard ? 2 : 4).map((s) => (
          <div key={s.name} className="overflow-hidden p-1.5" style={{ borderRadius: hard ? 4 : 12, background: palette.surface, border: `1px solid ${palette.border}`, boxShadow: hard ? `3px 3px 0 ${palette.border}` : 'none' }}>
            <div className="h-9" style={{ borderRadius: hard ? 3 : 10, background: `linear-gradient(135deg, hsl(${s.hue}, 70%, 78%), hsl(${s.hue + 40}, 80%, 66%))` }} />
            <p className="mt-1 truncate text-[10px] font-black" style={{ color: palette.text }}>{s.name}</p>
            <p className="font-mono text-[9px] font-black" style={{ color: palette.primary }}>{s.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassicPreviewBody({ palette }: { palette: PreviewPalette }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col px-4 pt-3" style={{ fontFamily: 'var(--f-ui)' }}>
      <div className="text-center">
        <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: palette.secondary, color: palette.primary, fontFamily: palette.displayFont, fontWeight: 600 }}>N</div>
        <p className="text-base" style={{ fontFamily: palette.displayFont, color: palette.text }}>Cafe Nour</p>
        <p className="text-[8px] uppercase tracking-widest" style={{ color: palette.textSoft }}>Levantine kitchen</p>
      </div>
      <div className="mt-2 flex gap-1 overflow-hidden">
        {['Featured', 'Mezze', 'Mains', 'Drinks'].map((c, i) => (
          <span key={c} className="rounded-full px-2 py-0.5 text-[8px] font-semibold" style={{ background: i === 0 ? palette.primary : 'transparent', border: i === 0 ? 'none' : `1px solid ${palette.border}`, color: i === 0 ? '#fff' : palette.textSoft }}>
            {c}
          </span>
        ))}
      </div>
      <div className="mt-2 flex-1 overflow-hidden">
        {SAMPLES.map((s, i) => (
          <div key={s.name} className="flex gap-2 py-2" style={{ borderBottom: i < SAMPLES.length - 1 ? `1px solid ${palette.border}` : 'none' }}>
            <div className="h-10 w-10 shrink-0 rounded-xl" style={{ background: `linear-gradient(135deg, hsl(${s.hue}, 65%, 80%), hsl(${s.hue + 30}, 70%, 72%))` }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold" style={{ fontFamily: palette.displayFont, color: palette.text }}>{s.name}</p>
              <p className="line-clamp-1 text-[9px]" style={{ color: palette.textSoft }}>{s.desc}</p>
              <p className="mt-0.5 font-mono text-[10px] font-bold" style={{ color: palette.primary }}>{s.price} EGP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModernPreviewBody({ palette }: { palette: PreviewPalette }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: palette.textSoft }}>Table 12</p>
        <p className="-mt-0.5 text-2xl font-bold tracking-tight" style={{ fontFamily: palette.displayFont, color: palette.text }}>Cafe Nour</p>
      </div>
      <div className="mt-2 flex gap-3 overflow-hidden">
        {['Featured', 'Mezze', 'Mains'].map((c, i) => (
          <span key={c} className="pb-0.5 text-[10px]" style={{ fontFamily: palette.displayFont, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? palette.text : palette.textSoft, borderBottom: i === 0 ? `2px solid ${palette.secondary}` : '2px solid transparent' }}>
            {c}
          </span>
        ))}
      </div>
      <div className="mt-2 flex-1 overflow-hidden">
        {SAMPLES.slice(0, 2).map((s) => (
          <div key={s.name} className="mb-2 overflow-hidden rounded-lg" style={{ background: palette.surface }}>
            <div className="h-14 w-full" style={{ background: `linear-gradient(135deg, hsl(${s.hue}, 65%, 80%), hsl(${s.hue + 30}, 70%, 72%))` }} />
            <div className="flex items-center gap-2 p-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-bold" style={{ fontFamily: palette.displayFont, color: palette.text }}>{s.name}</p>
                <p className="mt-0.5 font-mono text-[10px] font-bold" style={{ color: palette.text }}>{s.price} EGP</p>
              </div>
              <span className="flex h-5 w-5 items-center justify-center rounded-[3px] text-xs font-bold text-white" style={{ background: palette.primary }}>+</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElegantPreviewBody({ palette }: { palette: PreviewPalette }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col px-4 pt-3">
      <div className="text-center">
        <span className="inline-block border-y px-2 text-[8px] uppercase tracking-widest" style={{ fontFamily: palette.displayFont, fontStyle: 'italic', borderColor: palette.primary, color: palette.primary }}>Est · 2018</span>
        <p className="mt-1.5 text-xl font-normal tracking-wide" style={{ fontFamily: palette.displayFont, color: palette.text }}>Cafe Nour</p>
      </div>
      <div className="mt-2 flex gap-2 overflow-hidden" style={{ borderBottom: `1px solid ${palette.border}`, paddingBottom: 4 }}>
        {['Featured', 'Mezze', 'Mains'].map((c, i) => (
          <span key={c} className="text-[10px]" style={{ fontFamily: palette.displayFont, fontStyle: 'italic', fontWeight: i === 0 ? 600 : 400, color: i === 0 ? palette.primary : palette.textSoft }}>
            {c}
          </span>
        ))}
      </div>
      <div className="mt-2 grid flex-1 grid-cols-2 gap-1.5 overflow-hidden">
        {SAMPLES.map((s) => (
          <div key={s.name} className="overflow-hidden border" style={{ background: palette.surface, borderColor: palette.border }}>
            <div className="h-10 w-full" style={{ background: `linear-gradient(135deg, hsl(${s.hue}, 65%, 80%), hsl(${s.hue + 30}, 70%, 72%))` }} />
            <div className="p-1.5">
              <p className="truncate text-[10px] font-semibold" style={{ fontFamily: palette.displayFont, color: palette.text }}>{s.name}</p>
              <p className="mt-0.5 font-mono text-[9px] font-semibold" style={{ color: palette.primary }}>{s.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
