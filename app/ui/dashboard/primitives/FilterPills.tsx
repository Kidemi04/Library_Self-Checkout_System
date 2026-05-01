'use client';

import clsx from 'clsx';

type PillOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type FilterPillsProps<T extends string> = {
  options: PillOption<T>[];
  value: T;
  onChange: (next: T) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: FilterPillsProps<T>) {
  return (
    <div
      className={clsx('flex flex-wrap items-center gap-1.5', className)}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-pill font-sans transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-caption' : 'px-3 py-1.5 text-nav-link',
              active
                ? 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark'
                : 'bg-surface-card text-muted hover:bg-surface-cream-strong hover:text-ink dark:bg-dark-surface-card dark:text-on-dark-soft dark:hover:bg-dark-surface-strong dark:hover:text-on-dark',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={clsx(
                  'rounded-pill px-1.5 font-mono text-caption',
                  active
                    ? 'bg-canvas text-ink dark:bg-dark-canvas dark:text-on-dark'
                    : 'bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft',
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
