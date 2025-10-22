
'use client';
import React from 'react';

export type UIBook = {
  id: string;
  title: string;
  author: string;
  cover?: string;
  tags?: string[];
  available?: boolean;
  // common library catalogue fields (optional; shown only if present)
  classification?: string | null; // call number
  location?: string | null;       // shelf / branch
  isbn?: string | null;
  year?: string | number | null;
  publisher?: string | null;
};

type Props = {
  books: UIBook[];
  variant?: 'grid' | 'list';                  // card grid or compact list
  onDetailsClick?: (book: UIBook) => void;    // optional: “View details”
  onPrimaryActionClick?: (book: UIBook) => void; // optional: “Borrow / Request hold”
};

export default function BookList({
  books,
  variant = 'grid',
  onDetailsClick,
  onPrimaryActionClick,
}: Props) {
  if (!books?.length) return <EmptyState />;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    variant === 'grid' ? (
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>
    ) : (
      <ul className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm">{children}</ul>
    );

  return (
    <Wrapper>
      {books.map((b) => {
        const available = b.available === true;
        const unavailable = b.available === false;

        return (
          <li
            key={b.id}
            className={
              variant === 'grid'
                ? 'group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-swin-red/50'
                : 'relative p-4 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-swin-red/50'
            }
          >
            {/* left accent for availability (subtle but visible, like many uni catalogues) */}
            {b.available !== undefined && (
              <span
                aria-hidden
                className={[
                  'absolute left-0 top-0 h-full w-1',
                  available ? 'bg-green-500/70' : 'bg-amber-500/70',
                ].join(' ')}
              />
            )}

            <article className="flex gap-4">
              {/* Cover */}
              <figure className="relative shrink-0">
                {b.cover ? (
                  <img
                    src={b.cover}
                    alt=""
                    aria-hidden
                    className="h-28 w-20 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="h-28 w-20 rounded-lg bg-slate-100 ring-1 ring-slate-200" />
                )}
                {/* Availability pill on top-right of image on grid; below title for list */}
                {b.available !== undefined && variant === 'grid' && (
                  <span
                    className={[
                      'absolute -right-2 -top-2 rounded-full px-2 py-0.5 text-[10px] font-medium shadow',
                      available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800',
                    ].join(' ')}
                  >
                    {available ? 'Available' : 'On loan'}
                  </span>
                )}
              </figure>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-semibold text-swin-charcoal">
                  {b.title}
                </h3>
                <p className="truncate text-sm text-swin-charcoal/70">{b.author || 'Unknown author'}</p>

                {/* Availability (list variant shows it here) */}
                {b.available !== undefined && variant === 'list' && (
                  <div className="mt-1">
                    <span
                      className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
                        available ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800',
                      ].join(' ')}
                    >
                      {available ? 'Available' : 'On loan'}
                    </span>
                  </div>
                )}

                {/* Metadata row (like call number / location / ISBN / year) */}
                {(b.classification || b.location || b.isbn || b.year || b.publisher) && (
                  <dl className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 sm:grid-cols-2">
                    {b.classification && (
                      <MetaItem label="Call no.">{b.classification}</MetaItem>
                    )}
                    {b.location && <MetaItem label="Location">{b.location}</MetaItem>}
                    {b.isbn && <MetaItem label="ISBN">ISBN {b.isbn}</MetaItem>}
                    {b.publisher && <MetaItem label="Publisher">{b.publisher}</MetaItem>}
                    {b.year && <MetaItem label="Year">{String(b.year)}</MetaItem>}
                  </dl>
                )}

                {/* Tags (limited to 4 for density) */}
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

                {/* Actions */}
                {(onDetailsClick || onPrimaryActionClick) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {onDetailsClick && (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        onClick={() => onDetailsClick(b)}
                        aria-label={`View details for ${b.title}`}
                      >
                        View details
                      </button>
                    )}
                    {onPrimaryActionClick && (
                      <button
                        type="button"
                        disabled={unavailable}
                        className={[
                          'rounded-xl px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2',
                          unavailable
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-swin-charcoal text-swin-ivory shadow hover:opacity-95 focus:ring-swin-red/50',
                        ].join(' ')}
                        onClick={() => onPrimaryActionClick(b)}
                        aria-label={unavailable ? 'Not available' : `Borrow ${b.title}`}
                      >
                        {unavailable ? 'Request hold' : 'Borrow'}
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

/* ---------- Small helpers ---------- */

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
