'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { SupportMessage } from '@prisma/client';
import { ownerSendMessageAction } from '@/app/actions/support.actions';

const POLL_INTERVAL_MS = 4000;

interface Props {
  messages: SupportMessage[];
}

export function SupportChat({ messages: initial }: Props): React.JSX.Element {
  const t = useTranslations('owner.recommendations');
  const [messages, setMessages] = useState<SupportMessage[]>(initial);
  const [draft, setDraft] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestIdRef = useRef<string | undefined>(initial[initial.length - 1]?.id);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  // Silent poll — fetches new messages, updates state without page reload
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/support/poll', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as SupportMessage[];
        const lastId = data[data.length - 1]?.id;
        if (lastId && lastId !== latestIdRef.current) {
          latestIdRef.current = lastId;
          setMessages(data);
          scrollToBottom();
        }
      } catch {
        // network error — silently ignore
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [scrollToBottom]);

  function send(): void {
    const content = draft.trim();
    if (!content) return;
    setError('');
    // Optimistic: add message immediately
    const optimistic: SupportMessage = {
      id: `opt-${Date.now()}`,
      restaurantId: '',
      senderRole: 'OWNER',
      content,
      readByAdmin: false,
      readByOwner: true,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    scrollToBottom();
    start(async () => {
      const result = await ownerSendMessageAction({ content });
      if (!result.ok) {
        setError(result.message);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        return;
      }
      // Replace optimistic with real data on next poll
    });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-base shadow-sm">
      <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-[400px] max-h-[600px]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="text-4xl">💬</span>
            <p className="font-display text-lg font-semibold text-text-primary">{t('emptyTitle')}</p>
            <p className="max-w-xs text-sm text-text-tertiary">{t('emptyHint')}</p>
          </div>
        ) : (
          messages.map((msg) => <Bubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-subtle p-4">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={t('chatPlaceholder')}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border-default bg-surface-sunken px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
          <button
            type="button"
            disabled={pending || !draft.trim()}
            onClick={send}
            className="flex h-full items-center rounded-xl bg-brand-primary px-5 text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-50"
          >
            {pending ? '…' : t('chatSend')}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-text-tertiary">{t('chatHint')}</p>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: SupportMessage }): React.JSX.Element {
  const isOwner = message.senderRole === 'OWNER';
  return (
    <div className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
      {!isOwner && (
        <span className="me-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white">
          T
        </span>
      )}
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isOwner
          ? 'rounded-br-sm bg-brand-primary text-white'
          : 'rounded-bl-sm bg-surface-sunken text-text-primary'
      }`}>
        <p>{message.content}</p>
        <p className={`mt-1 text-[10px] ${isOwner ? 'text-white/60' : 'text-text-tertiary'}`}>
          {new Date(message.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  );
}
