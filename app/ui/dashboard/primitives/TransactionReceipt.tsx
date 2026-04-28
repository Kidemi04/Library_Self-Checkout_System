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
  const accentText = tone === 'borrow' ? 'text-success' : 'text-accent-teal';
  const eyebrow = tone === 'borrow' ? 'Loan confirmed' : 'Return confirmed';

  return (
    <section
      className="rounded-card border border-hairline bg-canvas p-6 dark:border-dark-hairline dark:bg-dark-canvas"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <CheckCircleIcon className={`h-7 w-7 flex-shrink-0 ${accentText}`} strokeWidth={1.8} />
        <div className="min-w-0 flex-1">
          <p className={`font-sans text-caption-uppercase ${accentText}`}>
            {eyebrow}
          </p>
          <h3 className="mt-0.5 font-display text-display-sm text-ink dark:text-on-dark">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 font-sans text-body-md text-body dark:text-on-dark-soft">
              {subtitle}
            </p>
          )}
          {detailLines && detailLines.length > 0 && (
            <ul className="mt-3 space-y-0.5 font-mono text-code text-ink dark:text-on-dark">
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
          className="rounded-btn bg-primary px-5 py-2.5 font-sans text-button text-on-primary transition hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:bg-dark-primary dark:hover:bg-primary-active dark:focus-visible:ring-offset-dark-canvas"
        >
          {primaryLabel}
        </button>
        {secondary?.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-btn border border-hairline bg-surface-card px-5 py-2.5 font-sans text-button text-ink transition hover:border-primary/20 dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:border-dark-primary/30"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
