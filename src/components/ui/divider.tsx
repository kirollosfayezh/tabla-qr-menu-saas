import type { ReactNode } from 'react';

/** Horizontal divider with optional inline label. */
export function Divider({ children }: { children?: ReactNode }): React.JSX.Element {
  if (!children) {
    return <hr className="border-t border-border-subtle" />;
  }
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border-subtle" />
      <span className="text-xs uppercase tracking-wider text-text-tertiary">{children}</span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
