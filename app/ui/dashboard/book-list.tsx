'use client';

import React from 'react';
import Link from 'next/link';
import PlaceHoldButton from './place-hold-button';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import GlassCard from '@/app/ui/magic-ui/glass-card';
import BlurFade from '@/app/ui/magic-ui/blur-fade';

/** SIP-aligned item status (match your Supabase column) */
export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

export type UIBook = {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  tags?: string[] | null;
  // catalogue metadata (optional)
  classification?: string | null; // call number
  isbn?: string | null;
  year?: string | number | null;  // or publication_year
  publisher?: string | null;
  // availability
  status?: ItemStatus | null;
  copies_available?: number | null;
  total_copies?: number | null;
};

type Props = {
  books: UIBook[];
  variant?: 'grid' | 'list';               // card grid or compact list
  patronId?: string;                       // who is browsing (for holds)
  onDetailsClick?: (book: UIBook) => void; // optional: "View details"
  onBorrowClick?: (book: UIBook) => void;  // optional: "Borrow / Request" (deprecated, use Quick Borrow Link instead)
  pageSize?: number; // optional: number of books per page
};

const STATUS_META: Record<
  ItemStatus,
  { label: string; chip: string; stripe: string; canBorrow: boolean }
> = {
  available: { label: 'Available', chip: 'bg-green-100 text-green-700', stripe: 'bg-green-500/70', canBorrow: true },
  checked_out: { label: 'Checked out', chip: 'bg-amber-100 text-amber-800', stripe: 'bg-amber-500/70', canBorrow: false },
  on_hold: { label: 'On hold', chip: 'bg-violet-100 text-violet-800', stripe: 'bg-violet-500/70', canBorrow: false },
  reserved: { label: 'Reserved', chip: 'bg-blue-100 text-blue-800', stripe: 'bg-blue-500/70', canBorrow: false },
  maintenance: { label: 'Maintenance', chip: 'bg-slate-200 text-slate-700', stripe: 'bg-slate-400/70', canBorrow: false },
};

export default function BookList({
  books,
  variant = 'grid',
  patronId,
  pageSize,
}: Props) {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Determine number of books per page based on variant or prop
  const booksPerPage =
    pageSize ?? (variant === 'grid' ? 4 * 4 : 5); // 4 rows of 4 = 16 for grid, 5 for list

  const totalPages = Math.ceil(books.length / booksPerPage);

  // Slice books for current page
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  if (!books?.length) return <EmptyState />;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    variant === 'grid' ? (
      <BlurFade delay={0.2} yOffset={10} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {children}
      </BlurFade>
    ) : (
      <ul className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
      <BlurFade delay={0.2} yOffset={10} className="flex flex-col gap-3">
        {children}
      </BlurFade>
    );

  return (
    <>
      <Wrapper>
        {paginatedBooks.map((b, idx) => {
          const status = (b.status ?? 'available') as ItemStatus;
          const meta = STATUS_META[status] ?? STATUS_META.available;
          const canBorrow = meta.canBorrow && (b.copies_available ?? 1) > 0;
          const showCopies =
            typeof b.copies_available === 'number' && typeof b.total_copies === 'number';

        return (
          <li
            key={b.id}
            className={
              variant === 'grid'
                ? 'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-swin-red/50 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20'
                : 'relative p-4 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-swin-red/50 dark:hover:bg-slate-800/70'
            }
          >
            {/* status accent stripe */}
            <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${meta.stripe}`} />

              <article className="flex gap-3 sm:gap-4 text-slate-900 dark:text-slate-200">
              {/* cover */}
              <figure className="relative shrink-0">
                {b.cover ? (
                  <img
                    src={b.cover}
                    alt=""
                    aria-hidden
                    className="h-24 w-16 sm:h-28 sm:w-20 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="h-24 w-16 sm:h-28 sm:w-20 rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700" />
                )}
          return (
            <BlurFade key={b.id} delay={0.2 + idx * 0.05} yOffset={10}>
              {variant === 'grid' ? (
                <GlassCard
                  intensity="low"
                  className="group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {/* Status Stripe */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${meta.stripe}`} />

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {/* Header: Cover & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <figure className="relative shrink-0 shadow-md rounded-lg overflow-hidden">
                        {b.cover ? (
                          <img
                            src={b.cover}
                            alt=""
                            aria-hidden
                            className="h-28 w-20 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-28 w-20 bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-300 dark:text-white/20">
                            <span className="text-xs">No Cover</span>
                          </div>
                        )}
                      </figure>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${meta.chip}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold text-swin-charcoal dark:text-white leading-tight group-hover:text-swin-red transition-colors">
                        {b.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-swin-charcoal/70 dark:text-slate-400 font-medium">
                        {b.author || 'Unknown author'}
                      </p>

                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap gap-y-1 gap-x-3 text-[10px] text-swin-charcoal/60 dark:text-slate-500">
                        {b.year && <span>{b.year}</span>}
                        {b.classification && <span>• {b.classification}</span>}
                      </div>
                    </div>

              {/* content */}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold">{b.title}</h3>
                <p className="truncate text-xs sm:text-sm text-slate-700 dark:text-slate-400">
                  {b.author || 'Unknown author'}
                </p>
                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      {showCopies && (
                        <div className="text-[10px] font-medium text-swin-charcoal/80 dark:text-slate-400">
                          <span className={b.copies_available && b.copies_available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-swin-red"}>
                            {b.copies_available}
                          </span>
                          <span className="opacity-60"> / {b.total_copies} left</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!canBorrow && <PlaceHoldButton bookId={b.id} patronId={patronId} />}
                        {canBorrow && (
                          <Link
                            href={`/dashboard/check-out?bookId=${b.id}`}
                            className="rounded-full bg-swin-charcoal dark:bg-white text-white dark:text-swin-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-swin-red dark:hover:bg-swin-red dark:hover:text-white transition-colors shadow-sm"
                          >
                            Borrow
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard intensity="low" className="group relative flex items-center gap-4 p-4 transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/5">
                  {/* Status Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.stripe}`} />

                {/* copies summary */}
                {showCopies && (
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
                    Copies: <span className="font-medium text-slate-800 dark:text-slate-100">{b.copies_available}</span> of{' '}
                    <span className="font-medium text-slate-800 dark:text-slate-100">{b.total_copies}</span> available
                  </p>
                )}

                {/* metadata row */}
                {(b.classification || b.isbn || b.year || b.publisher) && (
                  <dl className="mt-2 grid grid-cols-1 gap-1 text-[11px] sm:text-xs text-slate-700 sm:grid-cols-2 dark:text-slate-400">
                    {b.classification && <MetaItem label="Call no.">{b.classification}</MetaItem>}
                    {b.isbn && <MetaItem label="ISBN">ISBN {b.isbn}</MetaItem>}
                    {b.publisher && <MetaItem label="Publisher">{b.publisher}</MetaItem>}
                    {b.year && <MetaItem label="Year">{String(b.year)}</MetaItem>}
                  </dl>
                )}

                {/* tags */}
                {!!b.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {b.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {t}
                  <figure className="relative shrink-0 shadow-sm rounded-md overflow-hidden">
                    {b.cover ? (
                      <img src={b.cover} alt="" className="h-16 w-12 object-cover" />
                    ) : (
                      <div className="h-16 w-12 bg-slate-100 dark:bg-white/10" />
                    )}
                  </figure>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    <div className="sm:col-span-2">
                      <h3 className="truncate text-sm font-bold text-swin-charcoal dark:text-white group-hover:text-swin-red transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-swin-charcoal/70 dark:text-slate-400">
                        {b.author} • {b.year}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                        {meta.label}
                      </span>
                      {showCopies && (
                        <span className="text-[10px] text-swin-charcoal/60 dark:text-slate-500">
                          {b.copies_available}/{b.total_copies}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {!canBorrow && <PlaceHoldButton bookId={b.id} patronId={patronId} />}
                      {canBorrow && (
                        <Link
                          href={`/dashboard/check-out?bookId=${b.id}`}
                          className="rounded-full bg-swin-charcoal dark:bg-white text-white dark:text-swin-charcoal px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:bg-swin-red dark:hover:bg-swin-red dark:hover:text-white transition-colors shadow-sm"
                        >
                          Borrow
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* actions */}
                {(onDetailsClick || onBorrowClick) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onDetailsClick && (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:focus:ring-slate-600"
                        onClick={() => onDetailsClick(b)}
                        aria-label={`View details for ${b.title}`}
                      >
                        View details
                      </button>
                    )}
                    {onBorrowClick && (
                      <button
                        type="button"
                        disabled={!canBorrow}
                        className={[
                          'rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2',
                          !canBorrow
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                            : 'bg-swin-charcoal text-swin-ivory shadow hover:opacity-95 focus:ring-swin-red/50 dark:bg-slate-800 dark:text-slate-100',
                        ].join(' ')}
                        onClick={() => canBorrow && onBorrowClick(b)}
                        aria-label={
                          !canBorrow
                            ? 'Not available for borrowing'
                            : `Borrow ${b.title}`
                        }
                      >
                        {canBorrow ? 'Borrow' : 'Not available'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </article>
          </li>
        );
      })}
    </Wrapper>
                </GlassCard>
              )}
            </BlurFade>
          );
        })}
      </Wrapper>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="rounded border px-4 py-1 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ChevronDoubleLeftIcon className='h-5 w-5' />
          </button>

          <span className="text-sm font-medium text-swin-charcoal/80 dark:text-slate-300">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="rounded border px-4 py-1 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <ChevronDoubleRightIcon className='h-5 w-5' />
          </button>
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
      <p className="text-sm">
        No books match your search. Try a different keyword or clear filters.
      </p>
    </div>
  );
}
