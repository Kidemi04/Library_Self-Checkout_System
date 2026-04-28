import clsx from 'clsx';

type UserAvatarProps = {
  name: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'red' | 'charcoal' | 'gold';
  className?: string;
};

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-12 w-12 text-[14px]',
};

const TONE: Record<'red' | 'charcoal' | 'gold', string> = {
  red: 'bg-primary text-on-primary dark:bg-dark-primary',
  charcoal: 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark',
  gold: 'bg-accent-amber text-on-primary',
};

export default function UserAvatar({
  name,
  size = 'md',
  tone = 'red',
  className,
}: UserAvatarProps) {
  const initials = (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex flex-shrink-0 items-center justify-center rounded-full border-2 border-hairline font-sans font-bold tracking-tight dark:border-dark-hairline',
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {initials}
    </span>
  );
}
