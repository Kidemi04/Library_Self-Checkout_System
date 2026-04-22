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
    <header className="mb-8 flex items-end justify-between gap-6 border-b border-swin-charcoal/10 pb-6 dark:border-white/10">
      <div>
        <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-swin-charcoal/40 dark:text-white/40">
          {subtitle}
        </p>
        <h1 className="font-display text-[34px] font-semibold leading-none tracking-tight text-swin-charcoal dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-swin-charcoal/60 dark:text-white/50">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-swin-charcoal/10 bg-white text-swin-charcoal/70 transition hover:border-swin-charcoal/20 hover:text-swin-charcoal dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/60 dark:hover:text-white"
        >
          <BellIcon className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-swin-red ring-2 ring-white dark:ring-swin-dark-bg" />
        </Link>
        {rightSlot}
      </div>
    </header>
  );
}
