'use client';

import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export type TransactionReceiptProps = {
  tone?: 'borrow' | 'return';
  title: string;
  subtitle?: string;
  detailLines?: string[];
  primaryLabel: string;
  onPrimaryClick: () => void;
  secondary?: Array<{ label: string; href: string }>;
};

export default function TransactionReceipt({
  tone = 'borrow',
  title,
  subtitle,
  detailLines,
  primaryLabel,
  onPrimaryClick,
  secondary,
}: TransactionReceiptProps) {
  const accent =
    tone === 'borrow'
      ? 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
      : 'from-sky-500/15 to-sky-500/5 border-sky-500/30 text-sky-700 dark:text-sky-300';

  return (
    <section
      className={`rounded-2xl border bg-gradient-to-br ${accent} p-6 shadow-sm`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="h-7 w-7 flex-shrink-0" strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[2px] opacity-80">
            {tone === 'borrow' ? 'Loan confirmed' : 'Return confirmed'}
          </p>
          <h3 className="mt-0.5 font-display text-[22px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 font-display text-[13px] italic text-swin-charcoal/70 dark:text-white/70">
              {subtitle}
            </p>
          )}
          {detailLines && detailLines.length > 0 && (
            <ul className="mt-3 space-y-0.5 font-mono text-[12px] text-swin-charcoal/65 dark:text-white/65">
              {detailLines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrimaryClick}
          className="rounded-xl bg-swin-red px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-swin-red/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/50"
        >
          {primaryLabel}
        </button>
        {secondary?.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-xl border border-swin-charcoal/15 bg-white px-4 py-2.5 text-[13px] font-semibold text-swin-charcoal transition hover:border-swin-charcoal/25 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
