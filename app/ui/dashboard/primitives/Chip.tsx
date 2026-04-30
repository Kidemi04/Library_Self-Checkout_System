import clsx from 'clsx';

type ChipTone = 'default' | 'danger' | 'gold' | 'success' | 'warn';

type ChipProps = {
  children: React.ReactNode;
  tone?: ChipTone;
  mono?: boolean;
  className?: string;
};

const toneClasses: Record<ChipTone, string> = {
  default: 'bg-swin-charcoal/8 text-swin-charcoal/70 dark:bg-white/8 dark:text-white/60',
  danger:  'bg-swin-red/10 text-swin-red dark:bg-swin-red/20 dark:text-red-300',
  gold:    'bg-swin-gold/12 text-swin-gold dark:bg-swin-gold/15 dark:text-yellow-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warn:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function Chip({ children, tone = 'default', mono = false, className }: ChipProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap',
        toneClasses[tone],
        mono && 'font-mono tracking-wide',
        className,
      )}
    >
      {children}
    </span>
  );
}
