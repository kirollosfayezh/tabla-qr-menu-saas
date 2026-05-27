'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './sidebar';

/** Hamburger button + slide-in drawer wrapping the desktop sidebar. */
export function MobileSidebar(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  // The drawer is closed on first paint (SSR + initial client render), so we can
  // safely defer to `typeof document` without risking a hydration mismatch: any
  // render where `open` is true happens after the user clicks, by which time
  // document.body exists.
  const portalTarget = typeof document === 'undefined' ? null : document.body;

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-raised lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      {open && portalTarget
        ? createPortal(
            <div
              className="fixed inset-0 z-[60] flex lg:hidden"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-[rgba(15,15,26,0.55)]"
              />
              <aside
                className="relative z-[61] flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto border-e border-border-subtle shadow-2xl"
                style={{ backgroundColor: 'var(--surface-base, #ffffff)' }}
              >
                <Sidebar onNavigate={() => setOpen(false)} />
              </aside>
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
}
