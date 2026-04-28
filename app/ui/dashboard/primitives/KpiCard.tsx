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
        'rounded-card border border-hairline bg-surface-card px-8 pb-6 pt-7',
        'dark:border-dark-hairline dark:bg-dark-surface-card',
        className,
      )}
    >
      <p className="mb-3 font-sans text-caption-uppercase text-muted-soft dark:text-on-dark-soft">
        {label}
      </p>
      <p className="font-display text-display-sm text-ink dark:text-on-dark">
        {value}
      </p>
      {delta && (
        <p
          className={clsx(
            'mt-3 font-mono text-caption font-semibold',
            danger ? 'text-primary' : positive ? 'text-success' : 'text-primary',
          )}
        >
          {delta}{' '}
          <span className="font-medium text-muted-soft dark:text-on-dark-soft">
            {footer}
          </span>
        </p>
      )}
    </div>
  );
}
