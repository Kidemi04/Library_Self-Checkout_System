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
      className={clsx(
        'flex flex-wrap items-center gap-1.5',
        className,
      )}
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
              'inline-flex items-center gap-1.5 rounded-full border font-medium transition',
              size === 'sm'
                ? 'px-2.5 py-1 text-[11px]'
                : 'px-3 py-1.5 text-[12px]',
              active
                ? 'border-swin-red bg-swin-red text-white'
                : 'border-swin-charcoal/10 bg-white text-swin-charcoal/70 hover:border-swin-charcoal/25 hover:text-swin-charcoal dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/60 dark:hover:text-white',
            )}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                className={clsx(
                  'rounded-full px-1.5 font-mono text-[10px] font-bold',
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-swin-charcoal/8 text-swin-charcoal/55 dark:bg-white/10 dark:text-white/55',
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
