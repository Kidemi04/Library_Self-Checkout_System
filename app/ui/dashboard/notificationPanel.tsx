'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { Notification } from '@/app/lib/supabase/notifications';

const POLL_INTERVAL_MS = 30_000;

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeConfig = {
  checkout: {
    label: 'Borrowed',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  checkin: {
    label: 'Returned',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 15 3 3m0 0 3-3m-3 3V8.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  loan_confirmed: {
    label: 'Loan confirmed',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  due_soon: {
    label: 'Due soon',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
} as const;

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=5');
      if (!res.ok) return;
      const { notifications: data } = (await res.json()) as { notifications: Notification[] };
      setNotifications(data ?? []);
      setUnreadCount((data ?? []).filter((n) => !n.is_read).length);
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const markOneRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    refresh();
  };

  const markAllRead = async () => {
    setMarking(true);
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    await refresh();
    setMarking(false);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-white">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-swin-red px-1.5 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="text-xs font-medium text-swin-red hover:underline disabled:opacity-50"
            >
              {marking ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
          <Link
            href="/dashboard/notifications"
            className="text-xs font-medium text-swin-charcoal/60 hover:text-swin-red dark:text-slate-400 dark:hover:text-swin-red"
          >
            View all →
          </Link>
        </div>
      </div>

      {/* Panel */}
      <div
        className={clsx(
          'overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5',
          'dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20',
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <svg className="h-5 w-5 animate-spin text-swin-charcoal/40 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
              No recent notifications
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-swin-charcoal/10 dark:divide-slate-800">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? typeConfig.checkout;
              return (
                <li
                  key={n.id}
                  className={clsx(
                    'flex items-start gap-4 px-5 py-4 transition-colors',
                    'hover:bg-swin-ivory dark:hover:bg-slate-800/60',
                    !n.is_read && 'bg-blue-50/40 dark:bg-slate-800/40',
                  )}
                >
                  {/* Type icon */}
                  <div
                    className={clsx(
                      'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                      cfg.badge,
                    )}
                  >
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                          cfg.badge,
                        )}
                      >
                        {cfg.label}
                      </span>
                      {!n.is_read && (
                        <span className={clsx('h-2 w-2 rounded-full', cfg.dot)} />
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-swin-charcoal dark:text-slate-100">
                      {n.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-swin-charcoal/60 dark:text-slate-400">
                      {n.message}
                    </p>
                  </div>

                  {/* Time + mark read */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <span className="text-xs text-swin-charcoal/40 dark:text-slate-500">
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.is_read && (
                      <button
                        onClick={() => markOneRead(n.id)}
                        className="text-xs text-swin-charcoal/50 hover:text-swin-red dark:text-slate-500 dark:hover:text-swin-red"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
