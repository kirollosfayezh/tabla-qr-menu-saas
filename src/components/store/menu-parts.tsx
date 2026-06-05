'use client';

// ── Tabla theme store — menu building blocks (photo, rating, tags, dish) ─────
// Every piece reads the `feat` flags so lower tiers genuinely render less.
import { StoreIcon } from './store-icon';
import type { EffectiveTheme } from './store-customization';
import type { FeatureFlags } from './store-data';
import type { Copy, DishItem, Lang } from './menu-content';

/**
 * Dish photo. Renders the curated Unsplash image over a hue-derived gradient,
 * so if the image is slow or fails to load the slot still shows a tasteful colour
 * block instead of a broken-image icon.
 */
export function FoodSlot({ item, radius = 0 }: { item: DishItem; radius?: number }): React.JSX.Element {
  const fallback = `linear-gradient(135deg, hsl(${item.hue},60%,78%), hsl(${(item.hue + 40) % 360},66%,68%))`;
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: radius,
        background: `url("${item.image}") center/cover no-repeat, ${fallback}`,
      }}
    />
  );
}

export function Stars({ rating, votes, theme, size = 12 }: { rating: number; votes?: number; theme: EffectiveTheme; size?: number }): React.JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: size, color: theme.soft, fontFamily: 'var(--f-num)' }}>
      <StoreIcon name="star" size={size + 1} color={theme.primary} style={{ fill: theme.primary }} />
      <b style={{ color: theme.text, fontWeight: 700 }}>{rating.toFixed(1)}</b>
      {votes != null && <span style={{ opacity: 0.7 }}>({votes})</span>}
    </span>
  );
}

export function TagChips({ item, theme, t, showFeatured = true }: { item: DishItem; theme: EffectiveTheme; t: Copy; showFeatured?: boolean }): React.JSX.Element | null {
  const tags = item.tags.filter((tg) => showFeatured || (tg !== 'chefPick' && tg !== 'popular'));
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((tg) => {
        const accent = tg === 'chefPick' || tg === 'popular';
        return (
          <span key={tg} style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: theme.radius >= 12 ? 999 : 2,
            background: accent ? theme.primary : 'transparent',
            color: accent ? (theme.dark ? theme.bg : '#fff') : theme.soft,
            border: accent ? 'none' : `1px solid ${theme.border}`,
          }}>{tg === 'chefPick' ? `★ ${t.chefPick}` : t[tg]}</span>
        );
      })}
    </div>
  );
}

interface DishProps {
  item: DishItem; theme: EffectiveTheme; feat: FeatureFlags; t: Copy; lang: Lang;
  onOpen: (item: DishItem) => void; onAdd: (item: DishItem) => void;
}

/** A single dish — adapts shape to theme.layout, content to feature flags. */
export function Dish({ item, theme, feat, t, lang, onOpen, onAdd }: DishProps): React.JSX.Element {
  const v = theme.layout;
  const clickable = feat.itemDetail;
  const darkCard = theme.dark && theme.layout === 'cards';
  const addBtn = feat.cart ? (
    <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} aria-label={t.add}
      style={{ width: 32, height: 32, borderRadius: theme.radius >= 12 ? 16 : theme.radius, border: darkCard ? `1px solid ${theme.primary}` : 'none',
        background: darkCard ? 'transparent' : theme.primary, color: darkCard ? theme.primary : (theme.dark ? theme.bg : '#fff'),
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <StoreIcon name="plus" size={16} stroke={2.2} />
    </button>
  ) : null;
  const price = <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 15, color: theme.primary }}>{item.price} {t.currency}</span>;
  const name = <span style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: v === 'editorial' ? 18 : 17, lineHeight: 1.2, color: theme.text, letterSpacing: theme.serif ? '0.01em' : '-0.015em' }}>{item[lang].name}</span>;
  const desc = <div style={{ fontSize: 12.5, color: theme.soft, lineHeight: 1.45, marginTop: 4, fontStyle: v === 'editorial' ? 'italic' : 'normal', fontFamily: v === 'editorial' ? theme.display : 'inherit', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item[lang].desc}</div>;

  if (v === 'editorial') {
    return (
      <div onClick={() => clickable && onOpen(item)} style={{ padding: '16px 0', borderBottom: `1px solid ${theme.border}`, cursor: clickable ? 'pointer' : 'default', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {feat.photos && <div style={{ width: 66, height: 66, flexShrink: 0 }}><FoodSlot item={item} /></div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            {name}
            <span style={{ flex: 1, borderBottom: `1px dotted ${theme.border}`, transform: 'translateY(-4px)' }} />
            {price}
          </div>
          {desc}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {feat.tags && <TagChips item={item} theme={theme} t={t} showFeatured={feat.featured} />}
              {feat.reviews && <Stars rating={item.rating} votes={item.votes} theme={theme} />}
            </div>
            {addBtn}
          </div>
        </div>
      </div>
    );
  }

  if (v === 'cards') {
    return (
      <div onClick={() => clickable && onOpen(item)} style={{ borderRadius: theme.radius, overflow: 'hidden', background: theme.surface, border: `1px solid ${theme.border}`, cursor: clickable ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}>
        {feat.photos && (
          <div style={{ width: '100%', height: 150, position: 'relative' }}>
            <FoodSlot item={item} />
            {feat.featured && item.tags.includes('chefPick') && (
              <div style={{ position: 'absolute', top: 10, insetInlineStart: 10, padding: '4px 9px', borderRadius: theme.radius >= 12 ? 999 : 2, background: theme.primary, color: theme.dark ? theme.bg : '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>★ {t.chefPick}</div>
            )}
          </div>
        )}
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>{name}{!feat.photos && price}</div>
          {desc}
          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {feat.photos && price}
              {feat.reviews && <Stars rating={item.rating} votes={item.votes} theme={theme} />}
              {feat.tags && !feat.reviews && <TagChips item={item} theme={theme} t={t} showFeatured={false} />}
            </div>
            {addBtn}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => clickable && onOpen(item)} style={{ display: 'flex', gap: 14, padding: '15px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'flex-start', cursor: clickable ? 'pointer' : 'default' }}>
      {feat.photos && <div style={{ width: 78, height: 78, flexShrink: 0 }}><FoodSlot item={item} radius={theme.radius} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>{name}{price}</div>
        {desc}
        {(feat.tags || feat.reviews || addBtn) && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {feat.tags && <TagChips item={item} theme={theme} t={t} showFeatured={feat.featured} />}
              {feat.reviews && <Stars rating={item.rating} votes={item.votes} theme={theme} />}
            </div>
            {addBtn}
          </div>
        )}
      </div>
    </div>
  );
}
