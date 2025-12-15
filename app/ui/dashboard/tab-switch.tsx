// app/ui/tab-switch.tsx
import Link from 'next/link';
import clsx from 'clsx';

export type TabSwitchItem = {
  key: string;     // Unique key for active state
  label: string;   // Text shown
  href: string;    // Navigation link
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

  return (
    <div
      className={clsx(
        'relative w-full h-14 rounded-xl flex p-1 bg-slate-200 dark:bg-slate-800',
        className
      )}
    >
      {/* Active background */}
      <div
        className="absolute inset-y-1 left-1 rounded-lg transition-all duration-300 bg-slate-800 dark:bg-slate-100"
        style={{
          width: `calc(${100 / count}% - 0.25rem)`,
          transform: `translateX(${items.findIndex(i => i.key === activeKey) * 100}%)`,
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
              'relative z-10 flex-1 flex items-center justify-center font-semibold tezt-lg md:text-lg transition-colors',
              isActive
                ? 'text-slate-200 dark:text-slate-800'
                : 'text-slate-800 dark:text-slate-200 '
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
