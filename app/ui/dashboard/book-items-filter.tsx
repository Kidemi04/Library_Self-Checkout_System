'use client';

import React from 'react';
import clsx from 'clsx';
import GlassCard from '@/app/ui/magic-ui/glass-card';
import BlurFade from '@/app/ui/magic-ui/blur-fade';

type SortField = 'title' | 'author' | 'year' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

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
  const q = defaults?.q ?? '';
  const status = defaults?.status ?? '';          // '' means “Any status”
  const sort = (defaults?.sort ?? 'title') as SortField;
  const order = (defaults?.order ?? 'asc') as SortOrder;
  const view = (defaults?.view ?? 'grid') as ViewMode;

  return (
    <BlurFade delay={0.2} yOffset={10}>
      <GlassCard intensity="low" className="p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="q" className="block text-xs font-semibold text-swin-charcoal/70 dark:text-slate-300 mb-1.5 ml-1">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search by title, author, ISBN..."
            className="w-full rounded-full border-none bg-slate-100/50 px-4 py-2.5 text-sm text-swin-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
          />
        </div>

        {/* Status */}
        <div className="min-w-[160px]">
          <label htmlFor="status" className="block text-xs font-semibold text-swin-charcoal/70 dark:text-slate-300 mb-1.5 ml-1">
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="w-full appearance-none rounded-full border-none bg-slate-100/50 px-4 py-2.5 pr-8 text-sm text-swin-charcoal focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white/5 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <option value="">Any status</option>
              <option value="available">Available</option>
              <option value="checked_out">Checked out</option>
              <option value="on_hold">On hold</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Sort field */}
        <div className="min-w-[140px]">
          <label htmlFor="sort" className="block text-xs font-semibold text-swin-charcoal/70 dark:text-slate-300 mb-1.5 ml-1">
            Sort by
          </label>
          <div className="relative">
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="w-full appearance-none rounded-full border-none bg-slate-100/50 px-4 py-2.5 pr-8 text-sm text-swin-charcoal focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white/5 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="year">Year</option>
              <option value="created_at">Created time</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Sort order */}
        <div className="min-w-[120px]">
          <label htmlFor="order" className="block text-xs font-semibold text-swin-charcoal/70 dark:text-slate-300 mb-1.5 ml-1">
            Order
          </label>
          <div className="relative">
            <select
              id="order"
              name="order"
              defaultValue={order}
              className="w-full appearance-none rounded-full border-none bg-slate-100/50 px-4 py-2.5 pr-8 text-sm text-swin-charcoal focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white/5 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* View */}
        <div className="min-w-[100px]">
          <label htmlFor="view" className="block text-xs font-semibold text-swin-charcoal/70 dark:text-slate-300 mb-1.5 ml-1">
            View
          </label>
          <div className="relative">
            <select
              id="view"
              name="view"
              defaultValue={view}
              className="w-full appearance-none rounded-full border-none bg-slate-100/50 px-4 py-2.5 pr-8 text-sm text-swin-charcoal focus:outline-none focus:ring-2 focus:ring-swin-red/50 dark:bg-white/5 dark:text-white transition-all hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="sm:ml-auto w-full sm:w-auto">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-swin-red px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-swin-red/20 transition-all hover:bg-swin-red/90 hover:scale-105 hover:shadow-swin-red/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-swin-red/50"
          >
            Apply Filters
          </button>
        </div>
      </GlassCard>
    </BlurFade>
  );
}
