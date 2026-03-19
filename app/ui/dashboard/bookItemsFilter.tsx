'use client';

import React, { useRef } from 'react';
import clsx from 'clsx';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon, 
  Bars3BottomLeftIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

type SortField = 'title' | 'author' | 'year' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

type Props = {
  action?: string;
  defaults?: {
    q?: string;
    status?: ItemStatus;
    sort?: SortField;
    order?: SortOrder;
    view?: ViewMode;
  };
  className?: string;
};

export default function BookItemsFilter({ action, defaults, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const q = defaults?.q ?? '';
  const status = defaults?.status ?? '';
  const sort = (defaults?.sort ?? 'title') as SortField;
  const order = (defaults?.order ?? 'asc') as SortOrder;
  const view = (defaults?.view ?? 'grid') as ViewMode;

  /** Triggers form submission via requestSubmit to respect HTML5 validation */
  const handleAutoSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const desktopLabel = "hidden sm:block text-xs font-semibold text-slate-900 dark:text-slate-200";

  /** * Unified Select Style:
   * Mobile: Transparent overlay on top of an icon.
   * Desktop: Standard visible dropdown.
   */
  const unifiedSelectClass = `
    cursor-pointer focus:outline-none focus:ring-2 focus:ring-swin-red/50
    /* Mobile: Circular transparent touch target */
    absolute inset-0 opacity-0 sm:relative sm:opacity-100 
    /* Desktop: Standard rounded box */
    sm:mt-1 sm:block sm:rounded-xl sm:border sm:border-slate-300 sm:bg-white sm:px-3 sm:py-2 sm:text-sm
    dark:sm:border-slate-700 dark:sm:bg-slate-900 dark:sm:text-slate-100
  `;

  /** Wrapper for mobile icons to ensure they don't block clicks to the select */
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
        className
      )}
    >
      {/* 1. Search Box */}
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
            placeholder="Search books..."
            onKeyDown={(e) => e.key === 'Enter' && handleAutoSubmit()}
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 sm:pl-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Action Row - Mobile: icons in one row / Desktop: horizontal selects */}
      <div className="flex flex-row items-center justify-between gap-2 sm:contents">
        
        {/* Status Filter */}
        <div className="relative flex flex-col items-center sm:items-start">
          <label htmlFor="status" className={desktopLabel}>Status</label>
          <div className="relative">
            <div className={mobileIconStyle}><FunnelIcon className="h-5 w-5" /></div>
            <select 
              id="status"
              name="status" 
              defaultValue={status} 
              onChange={handleAutoSubmit}
              className={clsx(unifiedSelectClass, "sm:w-[150px]")}
            >
              <option value="">Any Status</option>
              <option value="available">Available</option>
              <option value="checked_out">Checked out</option>
              <option value="on_hold">On hold</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Sort Field */}
        <div className="relative flex flex-col items-center sm:items-start">
          <label htmlFor="sort" className={desktopLabel}>Sort</label>
          <div className="relative">
            <div className={mobileIconStyle}><Bars3BottomLeftIcon className="h-5 w-5" /></div>
            <select 
              id="sort" 
              name="sort" 
              defaultValue={sort} 
              onChange={handleAutoSubmit}
              className={clsx(unifiedSelectClass, "sm:w-[130px]")}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="year">Year</option>
              <option value="created_at">Created time</option>
            </select>
          </div>
        </div>

        {/* Order */}
        <div className="relative flex flex-col items-center sm:items-start">
          <label htmlFor="order" className={desktopLabel}>Order</label>
          <div className="relative">
            <div className={mobileIconStyle}><ArrowsUpDownIcon className="h-5 w-5" /></div>
            <select 
              id="order" 
              name="order" 
              defaultValue={order} 
              onChange={handleAutoSubmit}
              className={clsx(unifiedSelectClass, "sm:w-[130px]")}
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>
        </div>

        {/* View Mode */}
        <div className="relative flex flex-col items-center sm:items-start">
          <label htmlFor="view" className={desktopLabel}>View</label>
          <div className="relative">
            <div className={mobileIconStyle}>
              {view === 'grid' ? <Squares2X2Icon className="h-5 w-5" /> : <ListBulletIcon className="h-5 w-5" />}
            </div>
            <select 
              id="view" 
              name="view" 
              defaultValue={view} 
              onChange={handleAutoSubmit}
              className={clsx(unifiedSelectClass, "sm:w-[110px]")}
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>
        </div>

        {/* Reset Link */}
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