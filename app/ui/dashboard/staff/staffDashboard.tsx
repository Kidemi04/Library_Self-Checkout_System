'use client';

import { useState } from 'react';
import {
  QrCodeIcon,
  BookOpenIcon,
  BookmarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import AdminShell from '@/app/ui/dashboard/adminShell';
import type { DashboardSummary, Loan } from '@/app/lib/supabase/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ReadyHoldLite = {
  id: string;
  patron: string;
  bookTitle: string;
  expiresAt: string | null;
};

type StaffDashboardProps = {
  userName: string | null;
  summary: DashboardSummary;
  recentLoans: Loan[];
  readyHolds: ReadyHoldLite[];
  readyHoldsCount: number;
};

const expiresFmt = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'short' });

function formatExpires(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return '—';
  return expiresFmt.format(d);
}

function formatActivity(loan: Loan): {
  type: 'checkout' | 'return';
  patron: string;
  book: string;
  barcode: string;
  minutesAgo: number;
} {
  const type: 'checkout' | 'return' = loan.returnedAt ? 'return' : 'checkout';
  const anchor = loan.returnedAt ?? loan.borrowedAt;
  const minutesAgo = Math.max(0, Math.round((Date.now() - new Date(anchor).getTime()) / 60_000));
  return {
    type,
    patron: loan.borrowerName ?? 'Unknown patron',
    book: loan.book?.title ?? 'Unknown book',
    barcode: loan.copy?.barcode ?? '—',
    minutesAgo,
  };
}

function formatTimeAgo(minutes: number): string {
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function StaffDashboard({
  userName,
  summary,
  recentLoans,
  readyHolds,
  readyHoldsCount,
}: StaffDashboardProps) {
  const router = useRouter();
  const [scanInput, setScanInput] = useState('');
  const firstName = userName?.split(' ')[0] ?? 'Staff';
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Checked out', value: summary.activeLoans, icon: BookOpenIcon, color: 'text-swin-gold' },
    { label: 'Available',   value: summary.availableBooks, icon: ArrowPathIcon, color: 'text-green-600 dark:text-green-400' },
    { label: 'Holds ready', value: readyHoldsCount, icon: BookmarkIcon, color: 'text-swin-red' },
    { label: 'Overdue',     value: summary.overdueLoans, icon: ExclamationTriangleIcon, color: 'text-swin-red' },
  ];

  const activity = recentLoans.map((loan) => ({ id: loan.id, ...formatActivity(loan) }));

  const handleScan = (mode: 'checkout' | 'checkin') => {
    const q = scanInput.trim();
    const target = mode === 'checkout' ? '/dashboard/book/checkout' : '/dashboard/book/checkin';
    const href = q ? `${target}?q=${encodeURIComponent(q)}` : target;
    router.push(href);
  };

  return (
    <AdminShell
      titleSubtitle="Staff Desk"
      title={`${tod}, ${firstName}`}
      description="Process borrowals and returns. Scan a barcode or search by patron name."
      primaryAction={
        <Link
          href="/dashboard/book/checkout"
          className="flex items-center gap-1.5 rounded-xl bg-swin-red px-3.5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-swin-red/90"
        >
          <QrCodeIcon className="h-3.5 w-3.5" />
          Quick scan
        </Link>
      }
    >
      {/* Scan form + stats */}
      <div className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        {/* Scan form */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 text-white"
          style={{ background: 'linear-gradient(135deg, #A81C2A 0%, #C82333 70%)', boxShadow: '0 16px 40px rgba(200,35,51,0.2)' }}
        >
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/7" />
          <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[2px] opacity-80">
            Self-Service Desk · Scan to Process
          </p>
          <h2 className="mb-5 font-display text-[28px] font-semibold leading-none tracking-tight">
            Quick checkout or return
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan('checkout');
            }}
            className="flex items-center gap-2.5 rounded-xl border border-white/22 bg-white/15 py-1 pl-3.5 pr-1.5"
          >
            <QrCodeIcon className="h-4 w-4 opacity-80" />
            <label htmlFor="staff-scan" className="sr-only">Scan barcode or type SWI code</label>
            <input
              id="staff-scan"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan barcode or type SWI-xxxxx…"
              autoComplete="off"
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/55 outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-[12px] font-bold text-swin-red transition hover:bg-white/90"
            >
              Process
            </button>
          </form>
          <div className="mt-3.5 flex gap-2">
            <button
              type="button"
              onClick={() => handleScan('checkout')}
              className="rounded-md border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/20"
            >
              Checkout
            </button>
            <button
              type="button"
              onClick={() => handleScan('checkin')}
              className="rounded-md border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/20"
            >
              Return
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3.5 rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl border border-swin-charcoal/8 bg-slate-50 p-3.5 dark:border-white/8 dark:bg-swin-dark-bg"
              >
                <Icon className={`mb-2 h-4 w-4 ${s.color}`} />
                <p className="font-display text-[28px] font-semibold leading-none tracking-tight text-swin-charcoal dark:text-white">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[1px] text-swin-charcoal/40 dark:text-white/40">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity + holds to shelve */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        {/* Activity today */}
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                Recent activity
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
                Last {activity.length} transaction{activity.length === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              href="/dashboard/book/history"
              className="rounded-md border border-swin-charcoal/10 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-swin-charcoal/60 transition hover:text-swin-charcoal dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white"
            >
              Full history
            </Link>
          </div>
          <div>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-swin-charcoal/45 dark:text-white/45">
                No recent transactions yet.
              </p>
            ) : (
              activity.map((q, i) => (
                <div
                  key={q.id}
                  className={`flex items-center gap-3.5 py-3 ${i < activity.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: q.type === 'checkout' ? '#C9A961' : '#2F8F5A' }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-swin-charcoal dark:text-white">
                      {q.patron} —{' '}
                      <span className="font-display italic font-normal">{q.book}</span>
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wide text-swin-charcoal/40 dark:text-white/40">
                      {q.type === 'checkout' ? 'Checkout' : 'Return'} · {q.barcode}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-swin-charcoal/35 dark:text-white/35">
                    {formatTimeAgo(q.minutesAgo)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Holds to shelve */}
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                Holds to shelve
              </h2>
              <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
                {readyHoldsCount} ready for pickup
              </p>
            </div>
            <Link
              href="/dashboard/book/holds"
              className="rounded-md border border-swin-charcoal/10 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-swin-charcoal/60 transition hover:text-swin-charcoal dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:text-white"
            >
              Manage
            </Link>
          </div>
          <div>
            {readyHolds.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-swin-charcoal/45 dark:text-white/45">
                No holds awaiting pickup.
              </p>
            ) : (
              readyHolds.map((hold, i) => (
                <div
                  key={hold.id}
                  className={`py-3.5 ${i < readyHolds.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
                >
                  <p className="font-display text-[16px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                    {hold.bookTitle}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/50 dark:text-white/50">
                    Patron: {hold.patron}
                    {hold.expiresAt && ` · Expires ${formatExpires(hold.expiresAt)}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
