'use client';

import React from 'react';
import PlaceHoldButton from './place-hold-button';

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
  onDetailsClick?: (book: UIBook) => void; // optional: “View details”
  onBorrowClick?: (book: UIBook) => void;  // optional: “Borrow / Request”
};

const STATUS_META: Record<
  ItemStatus,
  { label: string; chip: string; stripe: string; canBorrow: boolean }
> = {
  available:   { label: 'Available',    chip: 'bg-green-100 text-green-700',     stripe: 'bg-green-500/70',     canBorrow: true  },
  checked_out: { label: 'Checked out',  chip: 'bg-amber-100 text-amber-800',    stripe: 'bg-amber-500/70',     canBorrow: false },
  on_hold:     { label: 'On hold',      chip: 'bg-violet-100 text-violet-800',  stripe: 'bg-violet-500/70',    canBorrow: false },
  reserved:    { label: 'Reserved',     chip: 'bg-blue-100 text-blue-800',      stripe: 'bg-blue-500/70',      canBorrow: false },
  maintenance: { label: 'Maintenance',  chip: 'bg-slate-200 text-slate-700',    stripe: 'bg-slate-400/70',     canBorrow: false },
};

export default function BookList({
  books,
  variant = 'grid',
  patronId,
  onDetailsClick,
  onBorrowClick,
}: Props) {
  if (!books?.length) return <EmptyState />;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    variant === 'grid' ? (
      // 2 columns on mobile, 3 on md, 4 on xl
      <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {children}
      </ul>
    ) : (
      <ul className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm">
        {children}
      </ul>
    );

  return (
    <Wrapper>
      {books.map((b) => {
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
                ? 'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-swin-red/50'
                : 'relative p-4 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-swin-red/50'
            }
          >
            {/* status accent stripe */}
            <span aria-hidden className={`absolute left-0 top-0 h-full w-1 ${meta.stripe}`} />

            <article className="flex gap-3 sm:gap-4 text-slate-900">
              {/* cover */}
              <figure className="relative shrink-0">
                {b.cover ? (
                  <img
                    src={b.cover}
                    alt=""
                    aria-hidden
                    className="h-24 w-16 sm:h-28 sm:w-20 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-24 w-16 sm:h-28 sm:w-20 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
                )}

                {/* status chip on image for grid variant */}
                {variant === 'grid' && (
                  <span className={`absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-[10px] font-medium shadow ${meta.chip}`}>
                    {meta.label}
                  </span>
                )}
              </figure>

              {/* content */}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm sm:text-base font-semibold">{b.title}</h3>
                <p className="truncate text-xs sm:text-sm text-slate-700">
                  {b.author || 'Unknown author'}
                </p>

                {/* status chip for list variant */}
                {variant === 'list' && (
                  <div className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </div>
                )}

                {/* copies summary */}
                {showCopies && (
                  <p className="mt-1 text-[11px] sm:text-xs text-slate-600">
                    Copies: <span className="font-medium text-slate-800">{b.copies_available}</span> of{' '}
                    <span className="font-medium text-slate-800">{b.total_copies}</span> available
                  </p>
                )}

                {/* metadata row */}
                {(b.classification || b.isbn || b.year || b.publisher) && (
                  <dl className="mt-2 grid grid-cols-1 gap-1 text-[11px] sm:text-xs text-slate-700 sm:grid-cols-2">
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
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* place hold when not available */}
                {!canBorrow && (
                  <div className="mt-3">
                    <PlaceHoldButton bookId={b.id} patronId={patronId} />
                  </div>
                )}

                {/* actions */}
                {(onDetailsClick || onBorrowClick) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onDetailsClick && (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-swin-charcoal text-swin-ivory shadow hover:opacity-95 focus:ring-swin-red/50',
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
  );
}

/* ---------- helpers ---------- */

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
      <dt className="sr-only">{label}</dt>
      <dd className="truncate">{children}</dd>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
      <p className="text-sm">
        No books match your search. Try a different keyword or clear filters.
      </p>
    </div>
  );
}
