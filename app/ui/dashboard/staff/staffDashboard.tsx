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
import type { DashboardSummary } from '@/app/lib/supabase/types';
import Link from 'next/link';

const STAFF_QUEUE = [
  { id: 'Q1', type: 'checkout', user: 'Kelvin Tan',  book: 'The Psychology of Money', barcode: 'SWI-00482', time: '2m' },
  { id: 'Q2', type: 'checkin',  user: 'Amelia Tan',  book: 'Clean Architecture',       barcode: 'SWI-00193', time: '5m' },
  { id: 'Q3', type: 'checkout', user: 'Marcus Lee',  book: 'Atomic Habits',            barcode: 'SWI-00391', time: '8m' },
];

const HOLDS_READY = [
  { id: 'H1', patron: 'Priya Suresh', book: 'Sapiens',    shelf: 'A-12', expires: 'Apr 24' },
  { id: 'H2', patron: 'Kenji Ito',    book: 'Deep Work',  shelf: 'B-04', expires: 'Apr 25' },
];

type StaffDashboardProps = {
  userName: string | null;
  summary: DashboardSummary;
};

export default function StaffDashboard({ userName, summary }: StaffDashboardProps) {
  const [scanInput, setScanInput] = useState('');
  const firstName = userName?.split(' ')[0] ?? 'Staff';
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  const stats = [
    { label: 'Checked out', value: summary.activeLoans, icon: BookOpenIcon,          color: 'text-swin-gold' },
    { label: 'Available',   value: summary.availableBooks, icon: ArrowPathIcon,       color: 'text-green-600 dark:text-green-400' },
    { label: 'Holds ready', value: 4,                    icon: BookmarkIcon,          color: 'text-swin-red' },
    { label: 'Overdue',     value: summary.overdueLoans, icon: ExclamationTriangleIcon, color: 'text-swin-red' },
  ];

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
          <div className="flex items-center gap-2.5 rounded-xl border border-white/22 bg-white/15 py-1 pl-3.5 pr-1.5">
            <QrCodeIcon className="h-4 w-4 opacity-80" />
            <input
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              placeholder="Scan barcode or type SWI-xxxxx…"
              className="flex-1 bg-transparent text-[13px] text-white placeholder-white/55 outline-none"
            />
            <button className="rounded-lg bg-white px-4 py-2 text-[12px] font-bold text-swin-red transition hover:bg-white/90">
              Process
            </button>
          </div>
          <div className="mt-3.5 flex gap-2">
            {['Checkout', 'Return', 'Renew'].map(a => (
              <button
                key={a}
                className="rounded-md border border-white/20 bg-white/12 px-3 py-1.5 text-[11px] font-semibold transition hover:bg-white/20"
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3.5 rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          {stats.map(s => {
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

      {/* Activity table + holds to shelve */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        {/* Activity today */}
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              Activity today
            </h2>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-green-600 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              LIVE
            </span>
          </div>
          <div>
            {STAFF_QUEUE.map((q, i) => (
              <div
                key={q.id}
                className={`flex items-center gap-3.5 py-3 ${i < STAFF_QUEUE.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: q.type === 'checkout' ? '#C9A961' : '#2F8F5A' }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-swin-charcoal dark:text-white">
                    {q.user} —{' '}
                    <span className="font-display italic font-normal">{q.book}</span>
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wide text-swin-charcoal/40 dark:text-white/40">
                    {q.type === 'checkout' ? 'Checkout' : 'Return'} · {q.barcode}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-swin-charcoal/35 dark:text-white/35">{q.time} ago</span>
                <button className="rounded-lg border border-swin-charcoal/12 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-swin-charcoal/60 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-white/55 dark:hover:bg-white/10">
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Holds to shelve */}
        <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
          <div className="mb-4">
            <h2 className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              Holds to shelve
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
              {HOLDS_READY.length} patrons notified
            </p>
          </div>
          <div>
            {HOLDS_READY.map((hold, i) => (
              <div
                key={hold.id}
                className={`py-3.5 ${i < HOLDS_READY.length - 1 ? 'border-b border-swin-charcoal/8 dark:border-white/8' : ''}`}
              >
                <p className="font-display text-[16px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                  {hold.book}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/50 dark:text-white/50">
                  Patron: {hold.patron} · Expires {hold.expires}
                </p>
                <div className="mt-2.5 flex gap-2">
                  <span className="rounded-md bg-swin-gold/12 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-swin-gold dark:bg-swin-gold/15 dark:text-yellow-300">
                    Shelf {hold.shelf}
                  </span>
                  <button className="rounded-md bg-swin-red px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-white transition hover:bg-swin-red/90">
                    Mark ready
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
