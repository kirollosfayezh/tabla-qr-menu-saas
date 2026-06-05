'use client';

// ── Tabla theme store — full-screen live preview modal ──────────────────────
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StoreIcon } from './store-icon';
import { DEVICES, DeviceFrame } from './device-frame';
import { CustomizePanel } from './customize-panel';
import { THEMES, TIERS } from './store-data';
import { ThemeRenderer } from '@/themes/theme.renderer';
import { buildSampleSnapshot, SAMPLE_CATEGORIES } from './sample-snapshot';
import type { ThemeKey } from './store-data';
import type { ThemeOverride } from './store-customization';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';
import type { DeviceKey } from './menu-types';
import type { CategoryWithItems, RestaurantSnapshot } from '@/themes/theme.types';

interface Props {
  themeKey: ThemeKey;
  initialOverride?: ThemeOverride;
  isCurrent: boolean;
  saving: boolean;
  onClose: () => void;
  onChoose: (themeKey: ThemeKey, override: ThemeOverride) => void;
  chooseLabel?: string;
  /** Disable the choose CTA (e.g. a premium theme during onboarding). */
  chooseDisabled?: boolean;
  /** When provided, the preview renders real owner data via ThemeRenderer. */
  restaurant?: RestaurantSnapshot;
  categories?: ReadonlyArray<CategoryWithItems>;
}

function ctaLabel(saving: boolean, isCurrent: boolean, chooseLabel?: string): string {
  if (saving) return 'Saving…';
  if (chooseLabel) return chooseLabel;
  return isCurrent ? 'Save changes' : 'Choose this theme';
}

function ctaStyle(saving: boolean, isCurrent: boolean, disabled: boolean): React.CSSProperties {
  const background = disabled ? 'rgba(255,255,255,0.16)' : isCurrent ? '#10B981' : '#FF6B35';
  const cursor = saving ? 'wait' : disabled ? 'not-allowed' : 'pointer';
  return { height: 40, padding: '0 18px', borderRadius: 10, border: 'none', background, color: '#fff', fontFamily: 'var(--f-ui)', fontWeight: 700, fontSize: 14, cursor, opacity: saving ? 0.7 : 1 };
}

export function PreviewModal({ themeKey, initialOverride, isCurrent, saving, onClose, onChoose, chooseLabel, chooseDisabled, restaurant, categories }: Props): React.JSX.Element {
  const [device, setDevice] = useState<DeviceKey>('phone');
  const [locale] = useState<'en' | 'ar'>(restaurant?.defaultLocale ?? 'en');
  const [showCustom, setShowCustom] = useState(false);
  const [override, setOverride] = useState<ThemeOverride>(initialOverride ?? {});
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const theme = THEMES[themeKey];
  const tier = TIERS[theme.tier];
  const customized = Object.keys(override).length > 0;

  const fit = useCallback((): void => {
    const el = stageRef.current;
    if (!el) return;
    const d = DEVICES[device];
    const padX = 80;
    const padY = device === 'laptop' ? 120 : 90;
    const frameW = device === 'laptop' ? 1480 : d.w;
    const frameH = d.h + (device === 'laptop' ? 26 : 0);
    setScale(Math.min((el.clientWidth - padX) / frameW, (el.clientHeight - padY) / frameH, 1));
  }, [device]);

  useLayoutEffect(() => { fit(); }, [fit, themeKey, showCustom]);
  useEffect(() => {
    const id = setTimeout(fit, 360);
    window.addEventListener('resize', fit);
    return () => { clearTimeout(id); window.removeEventListener('resize', fit); };
  }, [fit, showCustom]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const setCustom = (patch: ThemeOverride): void => setOverride((o) => ({ ...o, ...patch }));
  const resetCustom = (): void => setOverride({});

  // Always render via ThemeRenderer so marketing preview == actual production output.
  // When owner data is provided use it; otherwise fall back to the "Cafe Nour" sample data.
  const previewRestaurant: RestaurantSnapshot = restaurant
    ? { ...restaurant, themeKey, themeCustomization: override as ThemeOverrideDto }
    : buildSampleSnapshot(themeKey, override as ThemeOverrideDto, locale);
  const previewCats = categories ?? SAMPLE_CATEGORIES;

  return (
    <div className="tabla-modal-fade" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', background: 'rgba(8,8,15,0.86)', backdropFilter: 'blur(8px)' }}>
      <div className="tabla-preview-header" style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="tabla-preview-title" style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid rgba(255,255,255,0.16)', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><StoreIcon name="arrowLeft" size={18} /></button>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>{theme.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 999, background: tier.accent, color: '#0F0F1A' }}>{tier.name}</span>
            </div>
            <div style={{ fontSize: 12, color: '#8A8A9A', marginTop: 1 }}>{theme.sub}</div>
          </div>
        </div>
        <div className="tabla-preview-devices no-scrollbar" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 13, background: 'rgba(255,255,255,0.08)' }}>
          {Object.values(DEVICES).map((d) => {
            const on = device === d.key;
            return (
              <button key={d.key} onClick={() => setDevice(d.key)} title={d.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--f-ui)', fontSize: 13, fontWeight: 600, background: on ? '#fff' : 'transparent', color: on ? '#0F0F1A' : '#B4B4C4', boxShadow: on ? '0 2px 6px rgba(0,0,0,0.18)' : 'none', transition: 'all .15s' }}>
                <StoreIcon name={d.icon} size={16} />{d.label}
              </button>
            );
          })}
        </div>
        <div className="tabla-preview-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setShowCustom((s) => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 15px', borderRadius: 10, cursor: 'pointer', position: 'relative',
            border: showCustom ? '1px solid transparent' : '1px solid rgba(255,255,255,0.18)', background: showCustom ? '#fff' : 'transparent', color: showCustom ? '#0F0F1A' : '#fff', fontFamily: 'var(--f-ui)', fontWeight: 600, fontSize: 13.5 }}>
            <StoreIcon name="palette" size={16} />Customize
            {customized && <span style={{ position: 'absolute', top: -4, insetInlineEnd: -4, width: 9, height: 9, borderRadius: 5, background: '#FF6B35', border: '2px solid rgba(8,8,15,0.9)' }} />}
          </button>
          <button onClick={() => onChoose(themeKey, override)} disabled={saving || chooseDisabled} style={ctaStyle(saving, isCurrent, chooseDisabled ?? false)}>
            {ctaLabel(saving, isCurrent, chooseLabel)}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <CustomizePanel open={showCustom} base={theme} custom={override} setCustom={setCustom} onReset={resetCustom} />
        <div
          ref={stageRef}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 20 }}
        >
          <div key={device} className="tabla-device-pop" style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform .2s' }}>
            <DeviceFrame device={device}>
              <div className="pointer-events-none h-full w-full overflow-hidden">
                <ThemeRenderer restaurant={previewRestaurant} categories={previewCats} locale={locale} />
              </div>
            </DeviceFrame>
          </div>
        </div>
      </div>
    </div>
  );
}
