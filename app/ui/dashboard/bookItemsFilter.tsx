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
    return new URLSearchParams(searchParams?.toString() ?? '');
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
      className={clsx('flex flex-col gap-3', className)}
    >
      {/* Row 1: search input + view toggle */}
      <div className="flex items-center gap-2">
        {/* Search — text-input spec: canvas bg, rounded-btn (8px), h-10, hairline border */}
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-soft dark:text-on-dark-soft" />
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search title, author, ISBN…"
            suppressHydrationWarning
            className="h-10 w-full rounded-btn border border-hairline bg-canvas py-2.5 pl-9 pr-4 font-sans text-body-sm text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
          />
        </div>

        {/* View toggle — button-icon-circular: 36px circles, canvas bg, hairline border */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => updateParams({ view: 'grid' })}
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            suppressHydrationWarning
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              view === 'grid'
                ? 'border-ink bg-ink text-on-dark dark:border-on-dark dark:bg-on-dark dark:text-ink'
                : 'border-hairline bg-canvas text-muted hover:text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft dark:hover:text-on-dark',
            )}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => updateParams({ view: 'list' })}
            aria-label="List view"
            aria-pressed={view === 'list'}
            suppressHydrationWarning
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              view === 'list'
                ? 'border-ink bg-ink text-on-dark dark:border-on-dark dark:bg-on-dark dark:text-ink'
                : 'border-hairline bg-canvas text-muted hover:text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft dark:hover:text-on-dark',
            )}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: category tabs — category-tab / category-tab-active per DESIGN.md */}
      <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg bg-surface-soft p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:bg-dark-surface-soft">
        {CATEGORY_OPTIONS.map((cat) => {
          const active = cat.key === activeCategory;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => updateParams({ category: cat.key === 'all' ? null : cat.key })}
              disabled={isPending}
              aria-pressed={active}
              suppressHydrationWarning
              className={clsx(
                'flex-shrink-0 whitespace-nowrap rounded px-3.5 py-1.5 font-sans text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                active
                  ? 'bg-canvas text-ink shadow-sm dark:bg-dark-surface-card dark:text-on-dark'
                  : 'text-muted hover:text-body dark:text-on-dark-soft dark:hover:text-on-dark',
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Hidden fields for JS-off fallback */}
      <input type="hidden" name="view" value={view} />
      <input type="hidden" name="category" value={activeCategory} />
    </form>
  );
}
