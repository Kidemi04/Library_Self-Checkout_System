'use client';

import React from 'react';
import clsx from 'clsx';

type SortField = 'title' | 'author' | 'year' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewMode  = 'grid' | 'list';

// ✅ Keep this in sync with page.tsx and book-list.tsx
export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

type Props = {
  /** Where to submit the filter (defaults to /dashboard/book-items) */
  action?: string;
  /** Initial values coming from searchParams */
  defaults?: {
    q?: string;
    status?: ItemStatus;      // no empty string here
    sort?: SortField;
    order?: SortOrder;
    view?: ViewMode;
  };
  /** Optional: extra className wrapper */
  className?: string;
};

export default function BookItemsFilter({
  action = '/dashboard/book-items',
  defaults,
  className,
}: Props) {
  const q      = defaults?.q ?? '';
  const status = defaults?.status ?? '';          // '' means “Any status”
  const sort   = (defaults?.sort ?? 'title') as SortField;
  const order  = (defaults?.order ?? 'asc') as SortOrder;
  const view   = (defaults?.view ?? 'grid') as ViewMode;

  return (
    <form
      action={action}
      method="get"
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm',
        'dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20',
        'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end',
        className
      )}
    >
      {/* Search */}
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="q" className="block text-xs font-semibold text-slate-900 dark:text-slate-200">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search by title, author, ISBN, barcode"
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Status */}
      <div className="min-w-[180px]">
        <label htmlFor="status" className="block text-xs font-semibold text-slate-900 dark:text-slate-200">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">Any status</option>
          <option value="available">Available</option>
          <option value="checked_out">Checked out</option>
          <option value="on_hold">On hold</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Sort field */}
      <div className="min-w-[160px]">
        <label htmlFor="sort" className="block text-xs font-semibold text-slate-900 dark:text-slate-200">
          Sort by
        </label>
        <select
          id="sort"
          name="sort"
          defaultValue={sort}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="title">Title</option>
          <option value="author">Author</option>
          <option value="year">Year</option>
          <option value="created_at">Created time</option>
        </select>
      </div>

      {/* Sort order */}
      <div className="min-w-[140px]">
        <label htmlFor="order" className="block text-xs font-semibold text-slate-900 dark:text-slate-200">
          Order
        </label>
        <select
          id="order"
          name="order"
          defaultValue={order}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="asc">A → Z / Old → New</option>
          <option value="desc">Z → A / New → Old</option>
        </select>
      </div>

      {/* View */}
      <div className="min-w-[140px]">
        <label htmlFor="view" className="block text-xs font-semibold text-slate-900 dark:text-slate-200">
          View
        </label>
        <select
          id="view"
          name="view"
          defaultValue={view}
          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </div>

      {/* Submit + Reset */}
      <div className="flex items-center gap-2 sm:ml-auto">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-swin-charcoal px-4 py-2 text-sm font-semibold text-swin-ivory shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-slate-800 dark:text-slate-100"
        >
          Apply
        </button>
        <a
          href={action}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Reset
        </a>
      </div>
    </form>
  );
}
