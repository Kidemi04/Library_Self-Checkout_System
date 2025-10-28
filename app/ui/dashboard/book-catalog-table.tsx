'use client';

import { Fragment, useMemo, useState } from 'react';
import clsx from 'clsx';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import type { Book, BookStatus } from '@/app/lib/supabase/types';
import type { DashboardRole } from '@/app/lib/auth/types';
import ManageBookDialog from '@/app/ui/dashboard/manage-book-dialog';

type BookCatalogTableProps = {
  books: Book[];
  viewType: 'table' | 'grid'
  role: DashboardRole
};

const statusStyle: Record<BookStatus, string> = {
  available: 'bg-emerald-500/10 text-emerald-600',
  checked_out: 'bg-swin-red/10 text-swin-red',
  reserved: 'bg-amber-500/10 text-amber-600',
  maintenance: 'bg-slate-400/10 text-slate-600',
};

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDateTime = (value: string | null) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '--';
  return dateFormatter.format(date);
};

const formatStatusLabel = (status: BookStatus) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function BookCatalogTable({ books, viewType, role }: BookCatalogTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Page status
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10; // Books per page

  // Calculating paging data
  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = books.slice(startIndex, startIndex + booksPerPage);

  const editingBook = useMemo(() => {
    if (!editingId) return null;
    return books.find((book) => book.id === editingId) ?? null;
  }, [books, editingId]);

  if (!books.length) {
    return (
      <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-center text-sm text-swin-charcoal/60 shadow-sm shadow-swin-charcoal/5">
        No books in the catalogue yet. Add your first title.
      </div>
    );
  }

  return (
    <Fragment>
      <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5">

      {viewType == 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-swin-charcoal/10 text-sm">
              {/* Table Head */}
              <thead className="bg-swin-ivory text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Availability</th>
                  <th className="px-6 py-3">Classification</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Last activity</th>
                  {role == 'staff' && (
                    <th className="px-6 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              {/* Only render books on the current page */}
              <tbody className="divide-y divide-swin-charcoal/10 bg-white text-swin-charcoal">
                {currentBooks.map((book) => (
                  <tr key={book.id} className="transition hover:bg-swin-ivory">
                    
                    {/* Book Cover */}
                    <td className="relative w-[70px] h-[105px] p-1 ">
                      <img
                        src={book.cover_image_url || undefined} // Return nothing if dont have the image url
                        alt={book.title || 'Book cover'} // Add the Book Title at the cover image
                        className={book.cover_image_url ? 'rounded-md border-2 max-h-[150px]' : 'brightness-200'} // If have cover imamge, generate the broder
                        />
                    </td>

                    {/* Book Title */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-swin-charcoal">{book.title}</div>
                      <p className="text-xs text-swin-charcoal/60">
                        {book.author ?? 'Unknown author'} &bull;{' '}
                        {book.barcode ?? (book.isbn ? `ISBN ${book.isbn}` : 'No barcode')}
                      </p>
                    </td>

                    {/* Book Avaliability */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={clsx(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
                            statusStyle[book.status] ?? 'bg-slate-500/10 text-slate-600',
                          )}
                        >
                          {formatStatusLabel(book.status)}
                        </span>
                        <span className="text-xs text-swin-charcoal/60">
                          {(book.available_copies ?? 0)}/{book.total_copies ?? 0} available
                        </span>
                      </div>
                      
                    </td>

                    {/* Book Classification */}
                    <td className="px-6 py-4 text-swin-charcoal/70">{book.classification ?? '--'}</td>

                    {/* Book Location */}
                    <td className="px-6 py-4 text-swin-charcoal/70">{book.location ?? '--'}</td>

                    {/*Last Activity */}
                    <td className="px-6 py-4 text-swin-charcoal/70">{formatDateTime(book.last_transaction_at)}</td>

                    {role == 'staff' && (
                      // Manage Buttons
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingId(book.id)}
                          className="inline-flex items-center gap-2 rounded-md border border-swin-charcoal/20 bg-white px-3 py-2 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red hover:text-swin-red focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                          Manage
                        </button>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          ) : (
            // Grid View
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
            {currentBooks.map((book) => (
              <div
                key={book.id}
                className="rounded-xl border border-swin-charcoal/10 bg-white shadow-sm hover:shadow-md transition p-3 flex flex-col"
              >
                <img
                  src={book.cover_image_url || undefined}
                  alt={book.title}
                  className="w-full aspect-[2/3] object-cover rounded-md border border-swin-charcoal/10"
                />
                <div className="mt-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-swin-charcoal line-clamp-2">{book.title}</h3>
                  <p className="text-xs text-swin-charcoal/60 mb-2">{book.author ?? 'Unknown author'}</p>
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium w-fit',
                      statusStyle[book.status],
                    )}
                  >
                    {formatStatusLabel(book.status)}
                  </span>

                  {role == 'staff' && (
                    // Manage 
                    <button
                      onClick={() => setEditingId(book.id)}
                      className="mt-2 inline-flex items-center justify-center gap-1 rounded-md border border-swin-charcoal/20 bg-swin-ivory text-xs py-1.5 px-3 font-medium text-swin-charcoal hover:border-swin-red hover:text-swin-red transition"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                      Manage
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
          )}
    

        {/* Paging control */}
        <div className="flex items-center justify-center px-6 py-4 border-t border-swin-charcoal/10 bg-swin-ivory/50 text-sm text-swin-charcoal/70">
          
          {/* Previous Number */}
          <div className="flex gap-1 m-3">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className={clsx(
                'rounded-md border px-3 py-1.5 transition',
                currentPage === 1
                  ? 'cursor-not-allowed border-swin-charcoal/10 text-swin-charcoal/30'
                  : 'border-swin-charcoal/20 hover:bg-swin-charcoal/5',
              )}>
              Previous
            </button>
          </div>

          {/* Page number */}
          <div className='flex gap-2 m-3'>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Next button */}
          <div className='flex gap-2 m-3'>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className={clsx(
                'rounded-md border px-3 py-1.5 transition',
                currentPage === totalPages
                  ? 'cursor-not-allowed border-swin-charcoal/10 text-swin-charcoal/30'
                  : 'border-swin-charcoal/20 hover:bg-swin-charcoal/5',
              )} >
              Next
            </button>
          </div>

        </div>

      </div>

      {/* Book Editing */}
      {editingBook ? (
        <ManageBookDialog key={editingBook.id} book={editingBook} onClose={() => setEditingId(null)} />
      ) : null}
    </Fragment>
  );
}