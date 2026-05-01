import clsx from 'clsx';

type RoleBadgeProps = {
  role: 'admin' | 'staff' | 'user' | string;
  className?: string;
};

const STYLES: Record<string, { cls: string; label: string }> = {
  admin: {
    cls: 'bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary',
    label: 'ADMIN',
  },
  staff: {
    cls: 'bg-accent-amber/15 text-accent-amber dark:bg-accent-amber/20 dark:text-accent-amber',
    label: 'STAFF',
  },
  user: {
    cls: 'bg-surface-card text-muted dark:bg-dark-surface-card dark:text-on-dark-soft',
    label: 'STUDENT',
  },
};

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const s = STYLES[role] ?? STYLES.user;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-3 py-1 font-sans text-caption-uppercase whitespace-nowrap',
        s.cls,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
