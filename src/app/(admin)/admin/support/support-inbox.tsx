import Link from 'next/link';
import type { SupportRepository } from '@/repositories/support.repository';

type Conversation = Awaited<ReturnType<SupportRepository['listConversations']>>[number];

interface Props {
  conversations: Conversation[];
}

export function SupportInbox({ conversations }: Props): React.JSX.Element {
  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-default bg-surface-base p-12 text-center text-sm text-text-tertiary">
        No messages yet. Restaurants will appear here once they send their first message.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base shadow-sm">
      {conversations.map((conv, i) => (
        <Link
          key={conv.restaurantId}
          href={`/admin/support/${conv.restaurantId}`}
          className={`flex items-center gap-4 px-5 py-4 transition hover:bg-surface-raised ${i > 0 ? 'border-t border-border-subtle' : ''}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft font-display text-sm font-bold text-brand-primary">
            {conv.restaurantName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-text-primary">{conv.restaurantName}</p>
              {conv.unreadCount > 0 && (
                <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p className="truncate text-sm text-text-tertiary">{conv.lastMessage}</p>
          </div>
          <span className="shrink-0 text-xs text-text-tertiary">
            {new Date(conv.lastAt).toLocaleDateString([], { dateStyle: 'short' })}
          </span>
          <span className="text-text-tertiary">›</span>
        </Link>
      ))}
    </div>
  );
}
