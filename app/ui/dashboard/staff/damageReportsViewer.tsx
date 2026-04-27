'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ExclamationTriangleIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { DamageReportRow, DamageSeverity } from '@/app/lib/supabase/queries';
import DamageReportDetailModal from '@/app/ui/dashboard/staff/damageReportDetailModal';

const SEVERITY_OPTIONS: Array<{ value: DamageSeverity; label: string; color: string }> = [
  { value: 'damaged', label: 'Damaged', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  { value: 'lost', label: 'Lost', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' },
  { value: 'needs_inspection', label: 'Needs inspection', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200' },
];

const RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

type Props = {
  reports: DamageReportRow[];
  signedUrls: Record<string, string | null>;
  initialFilters: {
    severity: DamageSeverity[];
    range: string;
    q: string;
  };
};

export default function DamageReportsViewer({ reports, signedUrls, initialFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(initialFilters.q);
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const openReport = useMemo(
    () => reports.find((r) => r.id === openReportId) ?? null,
    [reports, openReportId],
  );

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  };

  const toggleSeverity = (severity: DamageSeverity) => {
    const current = initialFilters.severity;
    const next = current.includes(severity)
      ? current.filter((s) => s !== severity)
      : [...current, severity];
    updateParam('severity', next.length ? next.join(',') : null);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParam('q', searchValue.trim() || null);
  };

  const severityChip = (severity: DamageSeverity) => {
    const opt = SEVERITY_OPTIONS.find((s) => s.value === severity);
    if (!opt) return null;
    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
          opt.color,
        )}
      >
        {opt.label}
      </span>
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-MY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-swin-charcoal/40 dark:text-white/40" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by title, author, barcode, borrower, notes…"
            className="w-full rounded-xl border border-swin-charcoal/10 bg-white py-2 pl-9 pr-3 text-[13px] text-swin-charcoal placeholder:text-swin-charcoal/40 focus:border-swin-red/40 focus:outline-none focus:ring-2 focus:ring-swin-red/20 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white dark:placeholder:text-white/40"
          />
        </form>

        {/* Date range */}
        <select
          value={initialFilters.range}
          onChange={(e) => updateParam('range', e.target.value === 'all' ? null : e.target.value)}
          className="cursor-pointer rounded-xl border border-swin-charcoal/10 bg-white px-3 py-2 pr-8 text-[12px] text-swin-charcoal focus:border-swin-red/40 focus:outline-none focus:ring-2 focus:ring-swin-red/20 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white"
        >
          {RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Severity pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
          Severity:
        </span>
        {SEVERITY_OPTIONS.map((opt) => {
          const active = initialFilters.severity.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleSeverity(opt.value)}
              className={clsx(
                'rounded-full border px-3 py-1 text-[11px] font-medium transition',
                active
                  ? 'border-swin-red bg-swin-red/8 text-swin-red dark:bg-swin-red/15'
                  : 'border-swin-charcoal/15 bg-white text-swin-charcoal/70 hover:border-swin-charcoal/25 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/70',
              )}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
        {initialFilters.severity.length > 0 && (
          <button
            type="button"
            onClick={() => updateParam('severity', null)}
            className="ml-1 text-[11px] font-medium text-swin-red underline-offset-2 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="font-mono text-[11px] text-swin-charcoal/55 dark:text-white/55">
        {reports.length} {reports.length === 1 ? 'report' : 'reports'}
      </p>

      {/* List */}
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-swin-charcoal/15 bg-white/50 p-10 text-center dark:border-white/10 dark:bg-white/5">
          <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-swin-charcoal/30 dark:text-white/30" />
          <p className="mt-3 font-display text-[16px] text-swin-charcoal dark:text-white">
            No damage reports
          </p>
          <p className="mt-1 text-[12px] text-swin-charcoal/55 dark:text-white/55">
            Reports submitted during returns will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
          <table className="w-full text-left text-[12px]">
            <thead className="border-b border-swin-charcoal/10 bg-slate-50/60 font-mono text-[10px] uppercase tracking-wider text-swin-charcoal/55 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/55">
              <tr>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Book</th>
                <th className="px-4 py-3 font-semibold">Copy</th>
                <th className="px-4 py-3 font-semibold">Borrower</th>
                <th className="px-4 py-3 font-semibold">Reported by</th>
                <th className="px-4 py-3 font-semibold">Photos</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-swin-charcoal/[0.06] dark:divide-white/5">
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 align-top text-swin-charcoal/80 dark:text-white/80">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">{severityChip(r.severity)}</td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-display text-[13px] font-semibold text-swin-charcoal dark:text-white">
                      {r.copy?.book?.title ?? '—'}
                    </p>
                    {r.copy?.book?.author && (
                      <p className="text-[11px] text-swin-charcoal/55 dark:text-white/55">
                        by {r.copy.book.author}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-[11px] text-swin-charcoal/70 dark:text-white/70">
                    {r.copy?.barcode ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-swin-charcoal/80 dark:text-white/80">
                    {r.borrower?.displayName ?? r.borrower?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-swin-charcoal/70 dark:text-white/70">
                    {r.reportedBy?.displayName ?? r.reportedBy?.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {r.photoPaths.length > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-swin-charcoal/[0.05] px-2 py-0.5 font-mono text-[11px] text-swin-charcoal/70 dark:bg-white/10 dark:text-white/70">
                        <PhotoIcon className="h-3 w-3" />
                        {r.photoPaths.length}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-swin-charcoal/35 dark:text-white/35">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => setOpenReportId(r.id)}
                      className="rounded-lg border border-swin-charcoal/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-swin-charcoal/80 transition hover:border-swin-red/40 hover:text-swin-red dark:border-white/15 dark:bg-swin-dark-surface dark:text-white/80"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      <DamageReportDetailModal
        report={openReport}
        signedUrls={signedUrls}
        onClose={() => setOpenReportId(null)}
      />
    </div>
  );
}
