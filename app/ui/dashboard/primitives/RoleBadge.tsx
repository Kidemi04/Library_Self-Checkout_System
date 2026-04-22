import clsx from 'clsx';

type RoleBadgeProps = {
  role: 'admin' | 'staff' | 'user' | string;
  className?: string;
};

const STYLES: Record<string, { cls: string; label: string }> = {
  admin: { cls: 'bg-swin-red/12 text-swin-red border-swin-red/30 dark:bg-swin-red/20 dark:text-red-300', label: 'ADMIN' },
  staff: { cls: 'bg-swin-gold/12 text-swin-gold border-swin-gold/30 dark:bg-swin-gold/20 dark:text-yellow-300', label: 'STAFF' },
  user:  { cls: 'bg-swin-charcoal/8 text-swin-charcoal/70 border-swin-charcoal/15 dark:bg-white/8 dark:text-white/70 dark:border-white/15', label: 'STUDENT' },
};

export default function RoleBadge({ role, className }: RoleBadgeProps) {
  const s = STYLES[role] ?? STYLES.user;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.8px]',
        s.cls,
        className,
      )}
    >
      {s.label}
    </span>
  );
}
