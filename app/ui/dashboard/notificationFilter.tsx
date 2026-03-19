'use client';

import React from 'react';
import clsx from 'clsx';
// Using Heroicons (via heroicons package or similar svg imports)
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon, 
  BarsArrowDownIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

export type NotificationFilterType = 'all' | 'read' | 'unread' | 'flag';
export type NotificationSortField = 'date' | 'title' | 'author';
export type NotificationSortOrder = 'asc' | 'desc';

type Props = {
  action?: string;
  defaults?: {
    q?: string;
    filter?: NotificationFilterType;
    sort?: NotificationSortField;
    order?: NotificationSortOrder;
  };
  className?: string;
};

export default function NotificationsFilter({ action, defaults, className }: Props) {
  const q = defaults?.q ?? '';
  const filter = defaults?.filter ?? 'all';
  const sort = defaults?.sort ?? 'date';
  const order = defaults?.order ?? 'desc';

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.currentTarget.form?.submit();
  };

  const titleClassName = "hidden md:block text-xs font-semibold text-slate-900 dark:text-slate-200";
  
  const inputBaseClassName = `
    mt-1 w-full rounded-xl border px-3 py-2 text-sm
    bg-white border-slate-300 text-slate-900 
    dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 
    focus:outline-none focus:ring-2 focus:ring-swin-red/50
  `;

  // Style for mobile icon buttons
  const mobileActionBtn = `
    flex md:hidden relative items-center justify-center 
    w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 
    text-slate-600 dark:text-slate-400 active:scale-95 transition-transform
  `;

  return (
    <form 
      action={action} 
      method="get"
      className={clsx(
        "flex flex-row md:flex-row items-end gap-2 md:gap-3 p-3 md:p-5 rounded-2xl border-2",
        "bg-swin-ivory border-slate-200 dark:bg-slate-900/50 dark:border-slate-800",
        className
      )}
    >
      {/* 1. Search Box - Collapses to icon padding on mobile */}
      <div className="flex-1 min-w-0">
        <label htmlFor="q" className={titleClassName}>Search</label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none md:hidden">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search..."
            className={clsx(inputBaseClassName, "pl-9 md:pl-3 mt-0")}
          />
        </div>
      </div>

      {/* 2. Filter Status - Icon on mobile, Select on Desktop */}
      <div className="relative">
        <label htmlFor="filter" className={titleClassName}>Filter</label>
        <div className={mobileActionBtn}>
          <FunnelIcon className="h-5 w-5" />
          {/* Invisible select overlays the icon to trigger native UI */}
          <select 
            name="filter" 
            defaultValue={filter}
            onChange={handleSelectChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="all">All Notifications</option>
            <option value="seen">Read</option>
            <option value="unseen">Unread</option>
            <option value="flag">Flagged</option>
          </select>
        </div>
        <select 
          id="filter" 
          name="filter" 
          defaultValue={filter} 
          className={clsx(inputBaseClassName, "hidden md:block w-32")}
        >
          <option value="all">All</option>
          <option value="seen">Seen</option>
          <option value="unseen">Unseen</option>
          <option value="flag">Flag</option>
        </select>
      </div>

      {/* 3. Sort Field - Icon on mobile, Select on Desktop */}
      <div className="relative">
        <label htmlFor="sort" className={titleClassName}>Sort</label>
        <div className={mobileActionBtn}>
          <ArrowsUpDownIcon className="h-5 w-5" />
          <select 
            name="sort" 
            defaultValue={sort}
            onChange={handleSelectChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
          </select>
        </div>
        <select 
          id="sort" 
          name="sort" 
          defaultValue={sort} 
          className={clsx(inputBaseClassName, "hidden md:block w-32")}
        >
          <option value="date">Date</option>
          <option value="title">Title</option>
          <option value="author">Author</option>
        </select>
      </div>

      {/* 4. Sort Order - Icon on mobile, Select on Desktop */}
      <div className="relative">
        <label htmlFor="order" className={titleClassName}>Order</label>
        <div className={mobileActionBtn}>
          <BarsArrowDownIcon className="h-5 w-5" />
          <select 
            name="order" 
            defaultValue={order}
            onChange={handleSelectChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <select 
          id="order" 
          name="order" 
          defaultValue={order} 
          className={clsx(inputBaseClassName, "hidden md:block w-32")}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* 5. Actions: Apply & Reset */}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className={clsx(
            "flex items-center justify-center rounded-xl md:rounded-xl transition-colors",
            "bg-zinc-200 dark:bg-slate-700 md:px-4 h-10 w-10 md:w-auto",
            "text-slate-900 dark:text-slate-100"
          )}
          title="Apply"
        >
          <CheckIcon className="h-5 w-5 md:hidden" />
          <span className="hidden md:inline text-sm font-medium">Apply</span>
        </button>
        
        <a
          href={action}
          className={clsx(
            "flex items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700",
            "h-10 w-10 md:w-auto md:px-4 bg-white dark:bg-slate-900 text-slate-500",
            "transition-colors hover:bg-slate-50"
          )}
          title="Reset"
        >
          <ArrowPathIcon className="h-5 w-5 md:hidden" />
          <span className="hidden md:inline text-sm font-medium">Reset</span>
        </a>
      </div>
    </form>
  );
}