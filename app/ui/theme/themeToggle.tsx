'use client';

import clsx from 'clsx';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ui/theme/themeProvider';

type ThemeToggleProps = {
  className?: string;
  size?: 'default' | 'sm';
};

export default function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const sizeClasses = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={clsx(
        'inline-flex items-center justify-center rounded-full border border-hairline bg-surface-card text-ink transition',
        'hover:bg-surface-cream-strong dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
        sizeClasses,
        className,
      )}
    >
      {isDark ? <SunIcon className={iconSize} /> : <MoonIcon className={iconSize} />}
    </button>
  );
}
