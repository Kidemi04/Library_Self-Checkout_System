// app/ui/tab-switch.tsx
import Link from 'next/link';
import clsx from 'clsx';

export type TabSwitchItem = {
  key: string;
  label: string;
  href: string;
};

type TabSwitchProps = {
  items: TabSwitchItem[];
  activeKey: string;
  className?: string;
};

export default function TabSwitch({
  items,
  activeKey,
  className,
}: TabSwitchProps) {
  const count = items.length;
  const activeIndex = items.findIndex(i => i.key === activeKey);

  return (
    <div
      className={clsx(
        // Smaller height on mobile, allow horizontal scroll
        'relative w-full rounded-xl flex p-1',
        'h-12 md:h-14',
        'bg-slate-200 dark:bg-slate-800',
        'overflow-x-auto scrollbar-hide',
        className
      )}
    >
      {/* Active background */}
      <div
        className={clsx(
          // Compact indicator on mobile
          'absolute inset-y-1 left-1 rounded-lg transition-all duration-300',
          'bg-slate-800 dark:bg-slate-100'
        )}
        style={{
          width: `calc(${100 / count}% - 0.25rem)`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />

      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <Link
            key={item.key}
            href={item.href}
            prefetch
            className={clsx(
              'relative z-10 flex-1 min-w-[5rem]', // Prevent too narrow tabs
              'flex items-center justify-center text-center',
              'font-semibold transition-colors',
              // Smaller text on mobile
              'text-sm md:text-lg',
              // Allow wrapping instead of squeezing
              'leading-tight px-2',
              isActive
                ? 'text-slate-200 dark:text-slate-800'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-500 dark:hover:text-slate-400'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
