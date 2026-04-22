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

const variantClasses: Record<BadgeVariant, string> = {
  READY:     'bg-swin-red text-white',
  QUEUED:    'bg-swin-gold text-white',
  AVAILABLE: 'bg-green-500 text-white',
  ON_LOAN:   'bg-swin-gold text-white',
  OVERDUE:   'bg-swin-red text-white',
  RETURNED:  'bg-slate-400 text-white',
  CANCELLED: 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  DAMAGED:   'bg-orange-500 text-white',
  BORROWED:  'bg-blue-500 text-white',
};

type StatusBadgeProps = {
  status: BadgeVariant;
  className?: string;
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
        variantClasses[status],
        className,
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
