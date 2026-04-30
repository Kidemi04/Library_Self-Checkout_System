import clsx from 'clsx';
import type { ReactNode } from 'react';

type SectionCardProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  accent?: 'red' | 'gold' | 'none';
  padded?: boolean;
  className?: string;
  children: ReactNode;
};

export default function SectionCard({
  eyebrow,
  title,
  subtitle,
  action,
  accent = 'none',
  padded = true,
  className,
  children,
}: SectionCardProps) {
  const accentBorder =
    accent === 'red'
      ? 'border-swin-red/50 border-l-[3px] border-l-swin-red'
      : accent === 'gold'
      ? 'border-swin-gold/50 border-l-[3px] border-l-swin-gold'
      : 'border-swin-charcoal/10 dark:border-white/10';

  const hasHeader = eyebrow || title || subtitle || action;

  return (
    <section
      className={clsx(
        'rounded-2xl border bg-white dark:bg-swin-dark-surface',
        padded && 'p-7',
        accentBorder,
        className,
      )}
    >
      {hasHeader && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.01em] text-swin-charcoal dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 font-mono text-[11px] text-swin-charcoal/50 dark:text-white/50">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
