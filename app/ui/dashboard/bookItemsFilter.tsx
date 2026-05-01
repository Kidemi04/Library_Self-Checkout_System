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
        <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft dark:text-on-dark-soft" />
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Search title, author, ISBN…"
          className="w-full rounded-pill border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft py-2.5 pl-11 pr-4 font-sans text-body-sm text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
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
                'rounded-pill px-3.5 py-1.5 font-sans text-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
                active
                  ? 'bg-ink text-on-dark dark:bg-on-dark dark:text-ink'
                  : 'border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card text-body dark:text-on-dark/70 hover:border-primary/30 hover:text-ink dark:hover:text-on-dark',
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid/List toggle */}
      <div className="inline-flex items-center rounded-pill border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-1">
        <button
          type="button"
          onClick={() => updateParams({ view: 'grid' })}
          aria-pressed={view === 'grid'}
          aria-label="Grid view"
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-pill transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
            view === 'grid'
              ? 'bg-ink text-on-dark dark:bg-on-dark dark:text-ink'
              : 'text-muted-soft hover:text-ink dark:text-on-dark-soft dark:hover:text-on-dark',
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
            'flex h-8 w-8 items-center justify-center rounded-pill transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas',
            view === 'list'
              ? 'bg-ink text-on-dark dark:bg-on-dark dark:text-ink'
              : 'text-muted-soft hover:text-ink dark:text-on-dark-soft dark:hover:text-on-dark',
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
