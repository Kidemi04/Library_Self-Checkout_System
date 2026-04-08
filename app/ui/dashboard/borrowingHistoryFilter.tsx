'use client';

import React, { useRef } from 'react';
import clsx from 'clsx';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export type TimePeriod = 'all' | '30d' | '6m' | 'semester';

type Props = {
  action?: string;
  defaults?: {
    q?: string;
    period?: TimePeriod;
  };
  className?: string;
};

export default function BorrowingHistoryFilter({ action = '/dashboard/book/history', defaults, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const q = defaults?.q ?? '';
  const period = defaults?.period ?? 'all';

  const handleAutoSubmit = () => {
    formRef.current?.requestSubmit();
  };

  const desktopLabel = 'hidden sm:block text-xs font-semibold text-slate-900 dark:text-slate-200';

  const unifiedSelectClass = `
    cursor-pointer focus:outline-none focus:ring-2 focus:ring-swin-red/50
    absolute inset-0 opacity-0 sm:relative sm:opacity-100
    sm:mt-1 sm:block sm:rounded-xl sm:border sm:border-slate-300 sm:bg-white sm:px-3 sm:py-2 sm:text-sm
    dark:sm:border-slate-700 dark:sm:bg-slate-900 dark:sm:text-slate-100
  `;

  const mobileIconStyle = `
    flex items-center justify-center w-10 h-10 rounded-full
    bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400
    sm:hidden pointer-events-none
  `;

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all',
        'dark:border-slate-700 dark:bg-slate-900/80',
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end',
        className,
      )}
    >
      {/* Search */}
      <div className="flex-1 min-w-0 sm:min-w-[220px]">
        <label htmlFor="q" className={desktopLabel}>Search</label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none sm:hidden">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search by title or author..."
            onKeyDown={(e) => e.key === 'Enter' && handleAutoSubmit()}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 sm:pl-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-row items-center justify-between gap-2 sm:contents">
        {/* Period Filter */}
        <div className="relative flex flex-col items-center sm:items-start">
          <label htmlFor="period" className={desktopLabel}>Period</label>
          <div className="relative">
            <div className={mobileIconStyle}><FunnelIcon className="h-5 w-5" /></div>
            <select
              id="period"
              name="period"
              defaultValue={period}
              onChange={handleAutoSubmit}
              className={clsx(unifiedSelectClass, 'sm:w-[160px]')}
            >
              <option value="all">All time</option>
              <option value="30d">Last 30 days</option>
              <option value="6m">Last 6 months</option>
              <option value="semester">This semester</option>
            </select>
          </div>
        </div>

        {/* Reset */}
        <div className="flex items-center sm:ml-auto">
          <a
            href={action}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 sm:h-auto sm:w-auto sm:rounded-xl sm:px-4 sm:py-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Reset Filters"
          >
            <ArrowPathIcon className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline text-sm font-semibold">Reset</span>
          </a>
        </div>
      </div>
    </form>
  );
}
