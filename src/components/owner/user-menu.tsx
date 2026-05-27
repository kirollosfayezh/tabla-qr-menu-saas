'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { signOutAction } from '@/app/actions/sign-out.action';

interface UserMenuProps {
  name: string;
  email: string;
  image?: string | null;
}

/** Topbar avatar with a dropdown showing identity + a confirmed sign-out. */
export function UserMenu({ name, email, image }: UserMenuProps): React.JSX.Element {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmingSignOut(false);
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setConfirmingSignOut(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-surface-raised p-1 ps-1 pe-3 text-sm font-medium text-text-primary hover:bg-surface-sunken"
      >
        <Avatar name={initials} image={image ?? null} />
        <span className="hidden sm:inline">{name.split(' ')[0]}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-64 rounded-xl border border-border-subtle bg-surface-base p-2 shadow-xl"
        >
          <div className="px-2 py-2">
            <p className="truncate text-sm font-medium text-text-primary">{name}</p>
            <p className="truncate text-xs text-text-tertiary">{email}</p>
          </div>
          <hr className="my-1 border-border-subtle" />
          {confirmingSignOut ? (
            <SignOutConfirm onCancel={() => setConfirmingSignOut(false)} />
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => setConfirmingSignOut(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-text-primary hover:bg-surface-raised"
            >
              <SignOutIcon />
              {t('signOut')}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SignOutConfirm({ onCancel }: { onCancel: () => void }): React.JSX.Element {
  const t = useTranslations('common');
  return (
    <div className="space-y-2 px-2 py-2">
      <p className="text-sm text-text-secondary">{t('signOutConfirm')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-raised"
        >
          {t('cancel')}
        </button>
        <form action={signOutAction} className="flex-1">
          <button
            type="submit"
            className="w-full rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            {t('signOut')}
          </button>
        </form>
      </div>
    </div>
  );
}

function Avatar({ name, image }: { name: string; image: string | null }): React.JSX.Element {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
      {name || 'U'}
    </span>
  );
}

function SignOutIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  );
}
