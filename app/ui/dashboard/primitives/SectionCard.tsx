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
      ? 'border-primary/40 border-l-[3px] border-l-primary dark:border-dark-primary/40 dark:border-l-dark-primary'
      : accent === 'gold'
      ? 'border-accent-amber/40 border-l-[3px] border-l-accent-amber'
      : 'border-hairline dark:border-dark-hairline';

  const hasHeader = eyebrow || title || subtitle || action;

  return (
    <section
      className={clsx(
        'rounded-card border bg-surface-card dark:bg-dark-surface-card',
        padded && 'p-8',
        accentBorder,
        className,
      )}
    >
      {hasHeader && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-1.5 font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-display-sm text-ink dark:text-on-dark">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 font-sans text-body-md text-body dark:text-on-dark-soft">
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
