'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { InboxIcon, MagnifyingGlassIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import type { Notification } from '@/app/lib/supabase/notifications';
import type { NotificationFilterType } from '@/app/ui/dashboard/notificationFilter';
import NotificationItem from '@/app/ui/dashboard/primitives/NotificationItem';
import FilterPills from '@/app/ui/dashboard/primitives/FilterPills';

function shortTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Returns a day-group bucket label: Today / Yesterday / DD MMM. */
function dayBucket(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Earlier';
  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (isSameDay(d, today)) return 'Today';
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (isSameDay(d, y)) return 'Yesterday';
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

function NotificationDetails({ n }: { n: Notification }) {
  const m = n.metadata ?? {};
  const rows: { label: string; value: string }[] = [];
  if (m.bookTitle) rows.push({ label: 'Book', value: m.bookTitle });
  if (m.bookAuthor) rows.push({ label: 'Author', value: m.bookAuthor });
  if (m.barcode) rows.push({ label: 'Barcode', value: m.barcode });
  if (m.patronName) rows.push({ label: 'Borrower', value: m.patronName });
  if (m.patronIdentifier) rows.push({ label: 'Borrower ID', value: m.patronIdentifier });
  if (m.dueAt) rows.push({ label: 'Due date', value: formatDateTime(m.dueAt) });
  if (m.expiresAt) rows.push({ label: 'Pickup expires', value: formatDateTime(m.expiresAt) });
  if (m.loanId) rows.push({ label: 'Loan ID', value: m.loanId });
  if (m.holdId) rows.push({ label: 'Hold ID', value: m.holdId });
  rows.push({ label: 'Received', value: formatDateTime(n.created_at) });

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-3">
      {rows.map(({ label, value }) => (
        <div key={label}>
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
            {label}
          </dt>
          <dd className="mt-0.5 break-all font-mono text-swin-charcoal dark:text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

type InboxFilter = 'all' | 'unread';
type SortField = 'date' | 'title';
type SortOrder = 'desc' | 'asc';

interface Props {
  filter?: NotificationFilterType;
  searchQuery?: string;
}

export default function NotificationList({ filter: initialFilter = 'all', searchQuery: initialSearch = '' }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<InboxFilter>(
    initialFilter === 'unread' ? 'unread' : 'all',
  );
  const [search, setSearch] = useState<string>(initialSearch);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?filter=all&limit=200`);
      if (!res.ok) return;
      const { notifications: data } = (await res.json()) as { notifications: Notification[] };
      setNotifications(data ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = notifications.filter((n) => {
      if (filter === 'unread' && n.is_read) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.metadata?.bookTitle ?? '').toLowerCase().includes(q) ||
        (n.metadata?.bookAuthor ?? '').toLowerCase().includes(q)
      );
    });

    const direction = sortOrder === 'asc' ? 1 : -1;
    return [...matches].sort((a, b) => {
      if (sortField === 'title') {
        return a.title.localeCompare(b.title) * direction;
      }
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * direction;
    });
  }, [notifications, filter, search, sortField, sortOrder]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Group filtered notifications by day bucket, preserving server order (newest first).
  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of filtered) {
      const key = dayBucket(n.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return [...map.entries()];
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg
          className="h-6 w-6 animate-spin text-swin-charcoal/30 dark:text-white/30"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + sort bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-swin-charcoal/40 dark:text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, message, book…"
            className="w-full rounded-xl border border-swin-charcoal/10 bg-white py-2 pl-9 pr-3 text-[13px] text-swin-charcoal placeholder:text-swin-charcoal/40 focus:border-swin-red/40 focus:outline-none focus:ring-2 focus:ring-swin-red/20 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white dark:placeholder:text-white/40"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-swin-charcoal/10 bg-white px-1 py-1 text-[12px] dark:border-white/10 dark:bg-swin-dark-surface">
          <ArrowsUpDownIcon className="mx-1 h-4 w-4 text-swin-charcoal/40 dark:text-white/40" />
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="cursor-pointer border-0 bg-transparent pl-2 pr-7 text-swin-charcoal outline-none focus:ring-0 dark:text-white"
            aria-label="Sort field"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="cursor-pointer border-0 bg-transparent pl-2 pr-7 text-swin-charcoal outline-none focus:ring-0 dark:text-white"
            aria-label="Sort order"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>
        </div>
      </div>

      {/* Filter pills + Mark all read */}
      <div className="flex items-center justify-between gap-3">
        <FilterPills<InboxFilter>
          options={[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking === 'all'}
            className="inline-flex items-center gap-1.5 rounded-full border border-swin-charcoal/10 bg-white px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-swin-charcoal/60 transition hover:text-swin-red disabled:opacity-50 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/60 dark:hover:text-swin-red"
          >
            {marking === 'all' ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Grouped list */}
      <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <InboxIcon className="h-9 w-9 text-swin-charcoal/25 dark:text-white/25" />
            <div>
              <p className="font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                All caught up
              </p>
              <p className="mt-1 text-[12px] text-swin-charcoal/50 dark:text-white/50">
                {search.trim()
                  ? 'No notifications match your search.'
                  : filter === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications yet'}
              </p>
            </div>
          </div>
        ) : (
          groups.map(([dayLabel, items], gi) => (
            <div key={dayLabel}>
              <div
                className={`border-b border-swin-charcoal/8 bg-slate-50/60 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:border-white/8 dark:bg-white/[0.02] dark:text-white/45 ${
                  gi > 0 ? 'border-t' : ''
                }`}
              >
                {dayLabel}
              </div>
              <ul className="divide-y divide-swin-charcoal/8 dark:divide-white/8">
                {items.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      type={n.type}
                      title={n.title}
                      body={n.message}
                      timeLabel={shortTime(n.created_at)}
                      read={n.is_read}
                      onClick={() => {
                        setExpandedId((prev) => (prev === n.id ? null : n.id));
                        if (!n.is_read) markRead(n.id);
                      }}
                      expanded={expandedId === n.id}
                      details={
                        <div className="space-y-3">
                          <NotificationDetails n={n} />
                          {!n.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(n.id);
                              }}
                              disabled={marking === n.id}
                              className="rounded-md bg-swin-charcoal/5 px-3 py-1.5 text-[11px] font-semibold text-swin-charcoal/70 transition hover:bg-swin-red/10 hover:text-swin-red disabled:opacity-50 dark:bg-white/5 dark:text-white/70"
                            >
                              {marking === n.id ? '…' : 'Mark as read'}
                            </button>
                          )}
                        </div>
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
