'use client';

import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import type { Notification } from '@/app/lib/supabase/notifications';
import type { NotificationFilterType } from '@/app/ui/dashboard/notificationFilter';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const typeConfig = {
  checkout: {
    label: 'Borrowed',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  checkin: {
    label: 'Returned',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  loan_confirmed: {
    label: 'Loan confirmed',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  due_soon: {
    label: 'Due soon',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  hold_ready: {
    label: 'Hold ready',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  hold_placed: {
    label: 'Hold placed',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
} as const;

interface Props {
  filter?: NotificationFilterType;
  searchQuery?: string;
}

export default function NotificationList({ filter = 'all', searchQuery = '' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  const apiFilter = filter === 'read' ? 'read' : filter === 'unread' ? 'unread' : 'all';

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?filter=${apiFilter}&limit=100`);
      if (!res.ok) return;
      const { notifications: data } = (await res.json()) as { notifications: Notification[] };
      setNotifications(data ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const markRead = async (id: string) => {
    setMarking(id);
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    await refresh();
    setMarking(null);
  };

  const markAllRead = async () => {
    setMarking('all');
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    await refresh();
    setMarking(null);
  };

  const filtered = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      (n.metadata?.bookTitle ?? '').toLowerCase().includes(q) ||
      (n.metadata?.bookAuthor ?? '').toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="h-6 w-6 animate-spin text-swin-charcoal/30 dark:text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk action bar */}
      {unreadCount > 0 && filter !== 'read' && (
        <div className="flex items-center justify-between rounded-xl border border-swin-charcoal/10 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
          <span className="text-sm text-swin-charcoal/70 dark:text-slate-400">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={markAllRead}
            disabled={marking === 'all'}
            className="text-sm font-medium text-swin-red hover:underline disabled:opacity-50"
          >
            {marking === 'all' ? 'Marking…' : 'Mark all as read'}
          </button>
        </div>
      )}

      {/* List */}
      <div
        className={clsx(
          'overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5',
          'dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20',
        )}
      >
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
              {searchQuery ? 'No notifications match your search.' : 'No notifications here yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-swin-charcoal/10 dark:divide-slate-800">
            {filtered.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig.checkout;
              return (
                <li
                  key={n.id}
                  className={clsx(
                    'flex items-start gap-4 px-6 py-4 transition-colors',
                    'hover:bg-swin-ivory dark:hover:bg-slate-800/60',
                    !n.is_read && 'bg-blue-50/40 dark:bg-slate-800/40',
                  )}
                >
                  {/* Unread dot */}
                  <div className="mt-2 flex-shrink-0">
                    <span
                      className={clsx(
                        'block h-2.5 w-2.5 rounded-full transition-opacity',
                        n.is_read ? 'opacity-0' : cfg.dot,
                      )}
                    />
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          cfg.badge,
                        )}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-sm font-semibold text-swin-charcoal dark:text-slate-100">
                        {n.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-swin-charcoal/70 dark:text-slate-400">
                      {n.message}
                    </p>
                    {n.metadata?.patronIdentifier && (
                      <p className="mt-0.5 text-xs text-swin-charcoal/50 dark:text-slate-500">
                        Patron: {n.metadata.patronIdentifier}
                      </p>
                    )}
                  </div>

                  {/* Time + action */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <span className="text-xs text-swin-charcoal/40 dark:text-slate-500">
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        disabled={marking === n.id}
                        className={clsx(
                          'rounded-md px-2 py-1 text-xs font-medium transition-colors',
                          'bg-swin-charcoal/5 text-swin-charcoal/60 hover:bg-swin-red/10 hover:text-swin-red',
                          'dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-swin-red/10 dark:hover:text-swin-red',
                          marking === n.id && 'opacity-50',
                        )}
                      >
                        {marking === n.id ? '…' : 'Mark read'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
