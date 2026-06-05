'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StoreIcon } from '@/components/store/store-icon';
import { ThemeCard } from '@/components/store/theme-card';
import { PreviewModal } from '@/components/store/preview-modal';
import { PaymentMethodSheet } from '@/components/owner/payment-method-sheet';
import { InstapayModal } from '@/components/owner/instapay-modal';
import { selectThemeAction } from '@/app/actions/theme.actions';
import { openBlankPopup, openCheckout } from '@/lib/checkout-popup';
import { THEMES } from '@/components/store/store-data';
import { CardFooter } from './theme-card-footer';
import type { ThemeKey } from '@/components/store/store-data';
import type { ThemeOverride } from '@/components/store/store-customization';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';
import type { PaymentMethodId } from '@/lib/payments/payment-methods';
import type { CategoryWithItems, RestaurantSnapshot } from '@/themes/theme.types';
import type { ThemeRow } from './theme-card-footer';

export type { ThemeRow } from './theme-card-footer';

/**
 * The theme's own palette expressed as a customization override. Applying a
 * theme persists these so the live diner page renders the theme's own colors —
 * matching exactly what the preview showed — instead of leftover brand colors.
 */
function themeDefaults(key: ThemeKey): ThemeOverrideDto {
  const tk = THEMES[key];
  return {
    primary: tk.primary,
    secondary: tk.secondary,
    bg: tk.bg,
    surface: tk.surface,
    text: tk.text,
    soft: tk.soft,
    border: tk.border,
    dark: tk.dark,
    radius: tk.radius,
    display: tk.display as ThemeOverrideDto['display'],
    serif: tk.serif,
  };
}

interface Props {
  currentThemeKey: ThemeKey | null;
  initialOverride: ThemeOverride;
  themes: ThemeRow[];
  restaurant: RestaurantSnapshot;
  categories: ReadonlyArray<CategoryWithItems>;
  activePaymentMethods: ReadonlyArray<PaymentMethodId>;
}

export function ThemeStudio({ currentThemeKey, initialOverride, themes, restaurant, categories, activePaymentMethods }: Props): React.JSX.Element {
  const router = useRouter();
  const [preview, setPreview] = useState<ThemeKey | null>(null);
  const [activeKey, setActiveKey] = useState<ThemeKey | null>(currentThemeKey);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [paymentTheme, setPaymentTheme] = useState<ThemeRow | null>(null);
  const [showInstapay, setShowInstapay] = useState(false);

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin === window.location.origin && (event.data as { type?: string })?.type === 'tabla:payment-return') {
        window.location.reload();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const flash = (kind: 'ok' | 'err', text: string): void => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  };

  const choose = (themeKey: ThemeKey, override: ThemeOverride, method: Exclude<PaymentMethodId, 'instapay'> = 'card'): void => {
    const row = themes.find((t) => t.key === themeKey);
    const needsPayment = row ? !row.isFree && !row.isInPlan : false;
    const popup = needsPayment ? openBlankPopup() : null;
    // Switching to a different theme with no manual tweaks → bake in that theme's
    // own palette, so the live page matches the preview rather than keeping the
    // previous theme's brand colors. Customizing (or re-saving the active theme)
    // keeps whatever the owner chose.
    const isSwitching = themeKey !== activeKey;
    const finalOverride = isSwitching && Object.keys(override).length === 0 ? themeDefaults(themeKey) : override;
    startTransition(async () => {
      const res = await selectThemeAction({ themeKey, override: finalOverride, method });
      if (!res.ok) { popup?.close(); flash('err', res.message); return; }
      if (res.value.activated) {
        popup?.close();
        setActiveKey(themeKey);
        setPreview(null);
        setPaymentTheme(null);
        setShowInstapay(false);
        flash('ok', 'Theme applied successfully.');
      } else if (res.value.redirectUrl) {
        openCheckout(res.value.redirectUrl, popup);
        flash('ok', 'Opening secure checkout…');
      } else {
        popup?.close();
        window.location.reload();
      }
    });
  };

  const handleUse = (theme: ThemeRow): void => {
    if (theme.isFree || theme.isInPlan) {
      choose(theme.key, {});
      return;
    }
    setShowInstapay(false);
    setPaymentTheme(theme);
  };

  // The active theme previews with the owner's saved branding/customization;
  // every other theme previews with its own palette (like the marketing page),
  // so the gallery shows what each theme actually looks like — not the current one.
  const previewSnapshot = (key: ThemeKey): RestaurantSnapshot => {
    if (key === activeKey) return { ...restaurant, themeKey: key };
    const tk = THEMES[key];
    return { ...restaurant, themeKey: key, primaryColor: tk.primary, secondaryColor: tk.secondary, accentColor: tk.secondary };
  };

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            themeKey={theme.key}
            isCurrent={theme.key === activeKey}
            onPreview={setPreview}
            footer={
              <CardFooter
                theme={theme}
                isActive={theme.key === activeKey}
                isPending={isPending}
                onPreview={() => setPreview(theme.key)}
                onCustomize={() => router.push('/dashboard/branding')}
                onUse={() => handleUse(theme)}
              />
            }
          />
        ))}
      </div>

      {preview && (
        <PreviewModal
          themeKey={preview}
          initialOverride={preview === activeKey ? initialOverride : {}}
          isCurrent={preview === activeKey}
          saving={isPending}
          onClose={() => setPreview(null)}
          onChoose={choose}
          restaurant={previewSnapshot(preview)}
          categories={categories}
        />
      )}

      {paymentTheme && !showInstapay && (
        <PaymentMethodSheet
          planName={`${paymentTheme.name} theme`}
          availableMethods={activePaymentMethods}
          pending={isPending}
          onSelect={(method) => {
            if (method === 'instapay') {
              setShowInstapay(true);
              return;
            }
            choose(paymentTheme.key, {}, method);
          }}
          onClose={() => { setPaymentTheme(null); setShowInstapay(false); }}
        />
      )}

      {paymentTheme && showInstapay && (
        <InstapayModal
          target={{ kind: 'theme', key: paymentTheme.key, name: paymentTheme.name }}
          onClose={() => { setShowInstapay(false); setPaymentTheme(null); }}
          onSuccess={() => { setShowInstapay(false); setPaymentTheme(null); router.push('/dashboard/billing'); }}
        />
      )}

      {toast && (
        <div role="status" style={{ position: 'fixed', bottom: 24, insetInlineStart: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 12, background: toast.kind === 'ok' ? 'var(--success)' : 'var(--danger)', color: '#fff', fontWeight: 600, fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
          <StoreIcon name={toast.kind === 'ok' ? 'check' : 'x'} size={16} stroke={3} />{toast.text}
        </div>
      )}
    </div>
  );
}
