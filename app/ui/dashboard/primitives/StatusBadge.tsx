import clsx from 'clsx';

type BadgeVariant =
  | 'READY'
  | 'QUEUED'
  | 'AVAILABLE'
  | 'ON_LOAN'
  | 'OVERDUE'
  | 'RETURNED'
  | 'CANCELLED'
  | 'DAMAGED'
  | 'BORROWED';

type VariantStyle = {
  container: string;
  dot: string | null;
};

const variantStyles: Record<BadgeVariant, VariantStyle> = {
  READY:     { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-teal' },
  QUEUED:    { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-amber' },
  AVAILABLE: { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-success' },
  ON_LOAN:   { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-amber' },
  OVERDUE:   { container: 'bg-primary text-on-primary dark:bg-dark-primary',                       dot: null },
  RETURNED:  { container: 'bg-surface-soft text-muted dark:bg-dark-surface-soft dark:text-on-dark-soft', dot: null },
  CANCELLED: { container: 'bg-surface-soft text-muted dark:bg-dark-surface-soft dark:text-on-dark-soft', dot: null },
  DAMAGED:   { container: 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark', dot: 'bg-warning' },
  BORROWED:  { container: 'bg-surface-card text-ink dark:bg-dark-surface-card dark:text-on-dark', dot: 'bg-accent-teal' },
};

type StatusBadgeProps = {
  status: BadgeVariant;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const { container, dot } = variantStyles[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1 font-sans text-caption-uppercase whitespace-nowrap',
        container,
        className,
      )}
    >
      {dot && <span className={clsx('inline-block h-1.5 w-1.5 rounded-full', dot)} aria-hidden />}
      {status.replace('_', ' ')}
    </span>
  );
}
