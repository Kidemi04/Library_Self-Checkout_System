'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { DamageReportRow, DamageSeverity } from '@/app/lib/supabase/queries';

const SEVERITY_LABEL: Record<DamageSeverity, { label: string; color: string }> = {
  damaged: {
    label: 'Damaged',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  lost: {
    label: 'Lost',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
  needs_inspection: {
    label: 'Needs inspection',
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  },
};

type Props = {
  report: DamageReportRow | null;
  signedUrls: Record<string, string | null>;
  onClose: () => void;
};

export default function DamageReportDetailModal({ report, signedUrls, onClose }: Props) {
  if (!report) return null;

  const sev = SEVERITY_LABEL[report.severity];
  const formatDate = (iso: string | null | undefined) =>
    iso
      ? new Date(iso).toLocaleString('en-MY', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="damage-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-swin-dark-surface">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:text-white/45">
              Damage report · {formatDate(report.createdAt)}
            </p>
            <h2
              id="damage-detail-title"
              className="font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white"
            >
              {report.copy?.book?.title ?? 'Unknown book'}
            </h2>
            {report.copy?.book?.author && (
              <p className="mt-0.5 font-display text-[13px] italic text-swin-charcoal/65 dark:text-white/65">
                by {report.copy.book.author}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-swin-charcoal/50 transition hover:bg-swin-charcoal/5 hover:text-swin-charcoal dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Severity */}
        <div className="mb-5">
          <span
            className={clsx(
              'inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
              sev.color,
            )}
          >
            {sev.label}
          </span>
        </div>

        {/* Meta grid */}
        <dl className="mb-5 grid gap-x-6 gap-y-3 rounded-xl border border-swin-charcoal/10 bg-slate-50/60 p-4 font-mono text-[11px] dark:border-white/10 dark:bg-white/[0.02] sm:grid-cols-2">
          <div>
            <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
              Copy barcode
            </dt>
            <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
              {report.copy?.barcode ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
              Borrower
            </dt>
            <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
              {report.borrower?.displayName ?? report.borrower?.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
              Reported by
            </dt>
            <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
              {report.reportedBy?.displayName ?? report.reportedBy?.email ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
              Loan due / returned
            </dt>
            <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
              Due {formatDate(report.loan?.dueAt)}
              {report.loan?.returnedAt ? ` · Returned ${formatDate(report.loan.returnedAt)}` : ''}
            </dd>
          </div>
        </dl>

        {/* Notes */}
        <div className="mb-5">
          <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
            Notes
          </p>
          {report.notes ? (
            <p className="whitespace-pre-wrap rounded-lg border border-swin-charcoal/10 bg-white p-3 text-[13px] text-swin-charcoal dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/90">
              {report.notes}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed border-swin-charcoal/15 p-3 text-center font-mono text-[11px] text-swin-charcoal/45 dark:border-white/10 dark:text-white/45">
              No notes recorded.
            </p>
          )}
        </div>

        {/* Photos */}
        <div>
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
            Photos ({report.photoPaths.length})
          </p>
          {report.photoPaths.length === 0 ? (
            <p className="rounded-lg border border-dashed border-swin-charcoal/15 p-3 text-center font-mono text-[11px] text-swin-charcoal/45 dark:border-white/10 dark:text-white/45">
              No photos attached.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {report.photoPaths.map((path) => {
                const url = signedUrls[path];
                return (
                  <a
                    key={path}
                    href={url ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'group relative block aspect-square overflow-hidden rounded-lg border border-swin-charcoal/10 bg-slate-100 dark:border-white/10 dark:bg-white/5',
                      !url && 'pointer-events-none opacity-60',
                    )}
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`Damage photo ${path}`}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-[10px] text-swin-charcoal/40 dark:text-white/40">
                        Unable to load
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
