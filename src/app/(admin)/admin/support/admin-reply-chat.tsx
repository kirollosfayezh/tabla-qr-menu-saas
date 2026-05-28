'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { SupportMessage } from '@prisma/client';
import { adminReplyAction } from '@/app/actions/support.actions';

const POLL_INTERVAL_MS = 4000;

interface Props {
  restaurantId: string;
  messages: SupportMessage[];
}

export function AdminReplyChat({ restaurantId, messages: initial }: Props): React.JSX.Element {
  const [messages, setMessages] = useState<SupportMessage[]>(initial);
  const [draft, setDraft] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestIdRef = useRef<string | undefined>(initial[initial.length - 1]?.id);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/support?restaurantId=${restaurantId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as SupportMessage[];
        const lastId = data[data.length - 1]?.id;
        if (lastId && lastId !== latestIdRef.current) {
          latestIdRef.current = lastId;
          setMessages(data);
          scrollToBottom();
        }
      } catch {
        // silently ignore
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [restaurantId, scrollToBottom]);

  function reply(): void {
    const content = draft.trim();
    if (!content) return;
    setError('');
    const optimistic: SupportMessage = {
      id: `opt-${Date.now()}`,
      restaurantId,
      senderRole: 'ADMIN',
      content,
      readByAdmin: true,
      readByOwner: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    scrollToBottom();
    start(async () => {
      const result = await adminReplyAction(restaurantId, { content });
      if (!result.ok) {
        setError(result.message);
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-base shadow-sm">
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-text-tertiary">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isOwner = msg.senderRole === 'OWNER';
            return (
              <div key={msg.id} className={`flex ${isOwner ? 'justify-start' : 'justify-end'}`}>
                {isOwner && (
                  <span className="me-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[11px] font-bold text-text-secondary">R</span>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isOwner
                    ? 'rounded-bl-sm bg-surface-sunken text-text-primary'
                    : 'rounded-br-sm bg-brand-accent text-white'
                }`}>
                  {!isOwner && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-white/60">Tabla Admin</p>}
                  <p>{msg.content}</p>
                  <p className={`mt-1 text-[10px] ${isOwner ? 'text-text-tertiary' : 'text-white/50'}`}>
                    {new Date(msg.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border-subtle p-4">
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply(); } }}
            placeholder="Type your recommendation or reply…"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-border-default bg-surface-sunken px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
          />
          <button
            type="button"
            disabled={pending || !draft.trim()}
            onClick={reply}
            className="rounded-xl bg-brand-accent px-5 text-sm font-semibold text-white transition hover:bg-brand-accent/90 disabled:opacity-50"
          >
            {pending ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
