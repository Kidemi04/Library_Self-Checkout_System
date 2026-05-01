import { BellIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';
import Link from 'next/link';

type DashboardTitleBarProps = {
  subtitle: string;
  title: string;
  description: string;
  rightSlot?: ReactNode;
};

export default function DashboardTitleBar({
  subtitle,
  title,
  description,
  rightSlot,
}: DashboardTitleBarProps) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6 border-b border-hairline pb-6 dark:border-dark-hairline">
      <div>
        <p className="mb-1.5 font-sans text-caption-uppercase text-muted dark:text-muted-soft">
          {subtitle}
        </p>
        <h1 className="font-display text-display-lg tracking-tight text-ink dark:text-on-dark">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl font-sans text-body-md text-body dark:text-on-dark-soft">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-hairline bg-canvas text-muted transition hover:border-primary/20 hover:text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-muted dark:hover:text-on-dark"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-canvas dark:ring-dark-canvas" />
        </Link>
        {rightSlot}
      </div>
    </header>
  );
}
