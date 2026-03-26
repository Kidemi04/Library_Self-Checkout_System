'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { Notification } from '@/app/lib/supabase/notifications';

const POLL_MS = 20_000;
const AUTO_DISMISS_MS = 6_000;

interface Toast {
  id: string;
  notification: Notification;
  dismissing: boolean;
}

const typeConfig = {
  checkout: {
    label: 'Borrowed',
    colors: 'border-blue-400/60 bg-blue-50 dark:bg-slate-800 dark:border-blue-500/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  checkin: {
    label: 'Returned',
    colors: 'border-emerald-400/60 bg-emerald-50 dark:bg-slate-800 dark:border-emerald-500/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 15 3 3m0 0 3-3m-3 3V8.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  loan_confirmed: {
    label: 'Loan confirmed',
    colors: 'border-emerald-400/60 bg-emerald-50 dark:bg-slate-800 dark:border-emerald-500/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-emerald-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  due_soon: {
    label: 'Due soon',
    colors: 'border-amber-400/60 bg-amber-50 dark:bg-slate-800 dark:border-amber-500/40',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
} as const;

export default function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const dismissToast = useCallback((toastId: string) => {
    // Trigger exit animation
    setToasts((prev) =>
      prev.map((t) => (t.id === toastId ? { ...t, dismissing: true } : t)),
    );
    // Remove after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 350);
  }, []);

  const addToast = useCallback(
    (notification: Notification) => {
      const toastId = `toast-${notification.id}`;
      setToasts((prev) => [...prev, { id: toastId, notification, dismissing: false }]);
      setTimeout(() => dismissToast(toastId), AUTO_DISMISS_MS);
    },
    [dismissToast],
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?filter=all&limit=20');
      if (!res.ok) return;
      const { notifications } = (await res.json()) as { notifications: Notification[] };
      if (!notifications) return;

      if (!initialized.current) {
        // First load: mark everything as already seen — no toasts for old events
        notifications.forEach((n) => seenIds.current.add(n.id));
        initialized.current = true;
        return;
      }

      // Subsequent polls: show toast for any ID we haven't seen yet
      for (const n of notifications) {
        if (!seenIds.current.has(n.id)) {
          seenIds.current.add(n.id);
          addToast(n);
        }
      }
    } catch {
      // silently ignore network errors
    }
  }, [addToast]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 right-4 z-50 flex flex-col gap-3 md:bottom-8 md:right-8"
    >
      {toasts.map((toast) => {
        const cfg = typeConfig[toast.notification.type] ?? typeConfig.checkout;
        return (
          <div
            key={toast.id}
            className={clsx(
              'pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border p-4 shadow-xl transition-all duration-300',
              cfg.colors,
              toast.dismissing
                ? 'translate-x-4 opacity-0'
                : 'translate-x-0 opacity-100',
            )}
            style={{ transition: 'opacity 350ms ease, transform 350ms ease' }}
          >
            {/* Icon */}
            <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>

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
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {toast.notification.title}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-400">
                {toast.notification.message}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-1 flex-shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-black/10 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
