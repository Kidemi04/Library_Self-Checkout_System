'use client';

import clsx from 'clsx';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ui/theme/theme-provider';

type ThemeToggleProps = {
  className?: string;
  size?: 'default' | 'sm';
  context?: 'default' | 'sidebar';
};

export default function ThemeToggle({ className, size = 'default', context = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const isSidebar = context === 'sidebar';
  const containerClasses = size === 'sm' ? 'h-8 w-16' : 'h-10 w-[5.5rem]';
  const knobSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={clsx(
        'group relative inline-flex items-center rounded-full p-1 shadow-inner shadow-black/5 transition-all',
        isSidebar
          ? 'w-full border-white/10 bg-black/20 text-slate-100'
          : 'border-2 border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-swin-charcoal dark:text-slate-100',
        isSidebar ? 'h-[44px]' : containerClasses,
        className,
      )}
    >
      <div
        className={clsx(
          'absolute inset-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide',
          isSidebar ? 'px-3 text-slate-300' : 'px-2 text-slate-500 dark:text-slate-300',
        )}
      >
        <SunIcon className={clsx(iconSize, isDark ? 'opacity-40' : 'opacity-100 text-swin-red')} />
        <MoonIcon className={clsx(iconSize, isDark ? 'opacity-100 text-swin-red' : 'opacity-30')} />
      </div>
      {isSidebar ? (
        <span
          className={clsx(
            'absolute inset-y-[6px] w-[calc(50%-6px)] rounded-full shadow-lg transition-transform duration-300 ease-out',
            'bg-swin-ivory',
          )}
          style={{ transform: isDark ? 'translateX(0)' : 'translateX(calc(100%))' }}
        />
      ) : (
        <span
          className={clsx(
            'absolute top-1 rounded-full bg-white shadow-lg transition-all duration-300 ease-out',
            'dark:bg-slate-900',
            knobSize,
            isDark ? 'right-1 left-auto' : 'left-1 right-auto',
          )}
        />
      )}
    </button>
  );
}
