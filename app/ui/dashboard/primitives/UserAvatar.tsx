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
  red: 'bg-swin-red text-white',
  charcoal: 'bg-swin-charcoal text-white dark:bg-white/10 dark:text-white',
  gold: 'bg-swin-gold text-white',
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
        'inline-flex flex-shrink-0 items-center justify-center rounded-full font-sans font-bold tracking-tight',
        SIZE[size],
        TONE[tone],
        className,
      )}
    >
      {initials}
    </span>
  );
}
