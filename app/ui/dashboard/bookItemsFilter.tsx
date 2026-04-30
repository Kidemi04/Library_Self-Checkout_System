'use client';

import React, { useMemo, useRef, useTransition } from 'react';
import clsx from 'clsx';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { CATEGORY_OPTIONS, type CategoryKey } from '@/app/ui/dashboard/bookCategories';

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
    category?: CategoryKey;
  };
  className?: string;
};

export default function BookItemsFilter({ action, defaults, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const q = defaults?.q ?? '';
  const view = (defaults?.view ?? 'grid') as ViewMode;
  const activeCategory = (defaults?.category ?? 'all') as CategoryKey;

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(searchParams?.toString() ?? '');
    return p;
  }, [searchParams]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(baseParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const searchValue = (form.elements.namedItem('q') as HTMLInputElement | null)?.value ?? '';
    updateParams({ q: searchValue.trim() || null });
  };

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      onSubmit={handleSubmit}
      className={clsx(
        'flex flex-col gap-3 lg:flex-row lg:items-center',
        className,
      )}
    >
      {/* Search box */}
      <div className="relative flex-1 min-w-0 lg:max-w-sm">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-swin-charcoal/40 dark:text-white/40" />
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search title, author, ISBN…"
          className="w-full rounded-full border border-swin-charcoal/10 bg-white py-2.5 pl-11 pr-4 text-[13px] text-swin-charcoal placeholder:text-swin-charcoal/40 focus:border-swin-red/40 focus:outline-none focus:ring-2 focus:ring-swin-red/20 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white dark:placeholder:text-white/40"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-1 flex-wrap items-center gap-1.5 lg:justify-center">
        {CATEGORY_OPTIONS.map((cat) => {
          const active = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() =>
                updateParams({ category: cat.key === 'all' ? null : cat.key })
              }
              disabled={isPending}
              aria-pressed={active}
              className={clsx(
                'rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors',
                active
                  ? 'bg-swin-charcoal text-white dark:bg-white dark:text-swin-charcoal'
                  : 'border border-swin-charcoal/10 bg-white text-swin-charcoal/75 hover:border-swin-charcoal/25 hover:text-swin-charcoal dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/70 dark:hover:text-white',
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid/List toggle */}
      <div className="inline-flex items-center rounded-full border border-swin-charcoal/10 bg-white p-1 dark:border-white/10 dark:bg-swin-dark-surface">
        <button
          type="button"
          onClick={() => updateParams({ view: 'grid' })}
          aria-pressed={view === 'grid'}
          aria-label="Grid view"
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-full transition',
            view === 'grid'
              ? 'bg-swin-charcoal text-white dark:bg-white dark:text-swin-charcoal'
              : 'text-swin-charcoal/55 hover:text-swin-charcoal dark:text-white/55 dark:hover:text-white',
          )}
        >
          <Squares2X2Icon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => updateParams({ view: 'list' })}
          aria-pressed={view === 'list'}
          aria-label="List view"
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-full transition',
            view === 'list'
              ? 'bg-swin-charcoal text-white dark:bg-white dark:text-swin-charcoal'
              : 'text-swin-charcoal/55 hover:text-swin-charcoal dark:text-white/55 dark:hover:text-white',
          )}
        >
          <ListBulletIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Hidden fields so the default URL submit works if JS is off */}
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="category" value={activeCategory} />
    </form>
  );
}
