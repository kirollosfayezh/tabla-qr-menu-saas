'use client';

interface Props {
  messages?: ReadonlyArray<string>;
}

/**
 * Horizontally scrolling promo ticker bar.
 * Only renders when messages is non-empty.
 * Colors come from --d-primary / --d-on-primary set by ThemeColorProvider.
 */
export function PromoTicker({ messages = [] }: Props): React.JSX.Element | null {
  if (messages.length === 0) return null;
  const items = [...messages, ...messages];
  return (
    <div
      className="overflow-hidden"
      style={{ background: 'var(--d-primary)', color: 'var(--d-on-primary)', padding: '9px 0', flexShrink: 0 }}
    >
      <div className="marquee-track">
        {items.map((msg, i) => (
          <span key={i} style={{ fontSize: 13, fontWeight: 600, paddingInlineEnd: 44 }}>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
