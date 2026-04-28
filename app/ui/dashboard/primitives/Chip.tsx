import clsx from 'clsx';

type ChipTone = 'default' | 'danger' | 'gold' | 'success' | 'warn';

type ChipProps = {
  children: React.ReactNode;
  tone?: ChipTone;
  mono?: boolean;
  className?: string;
};

const toneClasses: Record<ChipTone, string> = {
  default: 'bg-surface-card text-muted dark:bg-dark-surface-card dark:text-on-dark-soft',
  danger:  'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary',
  gold:    'bg-accent-amber/15 text-accent-amber dark:bg-accent-amber/20 dark:text-accent-amber',
  success: 'bg-success/15 text-success dark:bg-success/20 dark:text-success',
  warn:    'bg-warning/15 text-warning dark:bg-warning/20 dark:text-warning',
};

export default function Chip({ children, tone = 'default', mono = false, className }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-pill px-3 py-1 font-sans text-caption leading-none whitespace-nowrap',
        toneClasses[tone],
        mono && 'font-mono tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  );
}
