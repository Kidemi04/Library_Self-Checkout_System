import clsx from 'clsx';

type KpiCardProps = {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  danger?: boolean;
  footer?: string;
  className?: string;
};

export default function KpiCard({
  label,
  value,
  delta,
  positive,
  danger,
  footer = 'this week',
  className,
}: KpiCardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border bg-white px-6 pb-5 pt-6',
        'border-swin-charcoal/10 dark:border-white/10 dark:bg-swin-dark-surface',
        className,
      )}
    >
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
        {label}
      </p>
      <p className="font-display text-[38px] font-semibold leading-none tracking-[-0.03em] text-swin-charcoal dark:text-white">
        {value}
      </p>
      {delta && (
        <p
          className={clsx(
            'mt-2.5 font-mono text-[11px] font-semibold',
            danger
              ? 'text-swin-red'
              : positive
              ? 'text-green-600 dark:text-green-400'
              : 'text-swin-red',
          )}
        >
          {delta}{' '}
          <span className="font-medium text-swin-charcoal/40 dark:text-white/40">
            {footer}
          </span>
        </p>
      )}
    </div>
  );
}
