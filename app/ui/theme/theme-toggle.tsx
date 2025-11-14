'use client';

import clsx from 'clsx';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ui/theme/theme-provider';

type ThemeToggleProps = {
  className?: string;
  size?: 'default' | 'sm';
};

export default function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const containerClasses = size === 'sm' ? 'h-8 w-16' : 'h-10 w-[5.5rem]';
  const knobSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const horizontalPadding = 4;
  const trackWidth = size === 'sm' ? 64 : 88;
  const knobWidth = size === 'sm' ? 24 : 32;
  const maxTranslate = trackWidth - knobWidth - horizontalPadding * 2;
  const targetX = isDark ? maxTranslate : 0;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={clsx(
        'group relative inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-slate-800 shadow-inner shadow-black/5 transition-all',
        'dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100',
        containerClasses,
        className,
      )}
    >
      <div
        className={clsx(
          'absolute inset-1 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-slate-500',
          'dark:text-slate-300',
        )}
      >
        <SunIcon className={clsx(iconSize, isDark ? 'opacity-40' : 'opacity-100 text-amber-500')} />
        <MoonIcon className={clsx(iconSize, isDark ? 'opacity-100 text-indigo-300' : 'opacity-30')} />
      </div>
      <span
        className={clsx(
          'absolute left-1 top-1 rounded-full bg-white shadow-lg transition-transform duration-300 ease-out',
          'dark:bg-slate-900',
          knobSize,
        )}
        style={{ transform: `translateX(${targetX}px)` }}
      />
    </button>
  );
}
