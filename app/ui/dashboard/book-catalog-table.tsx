'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import clsx from 'clsx';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Book, BookStatus } from '@/app/lib/supabase/types';
import { updateBookAction } from '@/app/dashboard/actions';
import { deleteBookAction } from '@/app/dashboard/actions';
import { initialActionState } from '@/app/dashboard/action-state';
import type { ActionState } from '@/app/dashboard/action-state';

type BookCatalogTableProps = {
  books: Book[];
};

const statusStyle: Record<BookStatus, string> = {
  available: 'bg-emerald-500/10 text-emerald-600',
  checked_out: 'bg-swin-red/10 text-swin-red',
  reserved: 'bg-amber-500/10 text-amber-600',
  maintenance: 'bg-slate-400/10 text-slate-600',
};

const statusOptions: Array<{ value: BookStatus; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'checked_out', label: 'Checked out' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
];

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

export default function BookCatalogTable({ books }: BookCatalogTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-swin-charcoal/10 text-sm">
            <thead className="bg-swin-ivory text-left text-xs font-semibold uppercase tracking-wider text-swin-charcoal/70">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Availability</th>
                <th className="px-6 py-3">Classification</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Last activity</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-swin-charcoal/10 bg-white text-swin-charcoal">
              {books.map((book) => (
                <tr key={book.id} className="transition hover:bg-swin-ivory">
                  
                  {/* Cover */}
                  <td className="relative w-[100px] h-[150px]">
                  <img
                    src={book.cover_image_url ?? ''}
                    alt={book.title || 'Book cover'}
                  ></img>
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

                  {/* Actions */}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingBook ? (
        <ManageBookDialog key={editingBook.id} book={editingBook} onClose={() => setEditingId(null)} />
      ) : null}
    </Fragment>
  );
}

type ManageBookDialogProps = {
  book: Book;
  onClose: () => void;
};

function ManageBookDialog({ book, onClose }: ManageBookDialogProps) {
  const [state, formAction] = useFormState(updateBookAction, initialActionState);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    if (state.status === 'success') {
      onClose();
    }
  }, [state.status, onClose]);

  const labelClass = 'block text-sm font-medium text-swin-charcoal';
  const inputClass =
    'mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm focus:border-swin-red focus:outline-none focus:ring-0';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-swin-charcoal shadow-xl shadow-swin-charcoal/10"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Manage book</h2>
            <p className="mt-1 text-sm text-swin-charcoal/60">
              Update catalogue details to keep the inventory accurate.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-swin-charcoal/20 p-2 text-swin-charcoal transition hover:bg-swin-charcoal/5"
            aria-label="Close manage book dialog"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="bookId" value={book.id} />

          <div>
            <label className={labelClass} htmlFor="manage-title">
              Title
            </label>
            <input
              id="manage-title"
              name="title"
              defaultValue={book.title}
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="manage-classification">
                Classification
              </label>
              <input
                id="manage-classification"
                name="classification"
                defaultValue={book.classification ?? ''}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="manage-location">
                Location
              </label>
              <input
                id="manage-location"
                name="location"
                defaultValue={book.location ?? ''}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="manage-status">
                Availability status
              </label>
              <select
                id="manage-status"
                name="status"
                defaultValue={book.status}
                className={clsx(inputClass, 'pr-8')}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="manage-available">
                Copies available
              </label>
              <input
                id="manage-available"
                name="availableCopies"
                type="number"
                min={0}
                defaultValue={book.available_copies ?? 0}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="manage-total">
              Total copies
            </label>
            <input
              id="manage-total"
              name="totalCopies"
              type="number"
              min={1}
              defaultValue={book.total_copies ?? 1}
              className={inputClass}
            />
          </div>

          <ActionFeedback state={state} />

          <div className="flex justify-between items-center pt-4 border-t border-swin-charcoal/10">
          
          {/* Delete Button */}
          <button
          type="button"
          onClick={async () => {
            if (confirm(`Are you sure you want to delete "${book.title}"? This action cannot be undone.`)) {
              const result = await deleteBookAction(book.id);
              alert(result.message);
              if (result.status === 'success') onClose();
            }
          }}
          className="inline-flex items-center justify-center rounded-md border border-swin-red/30 bg-swin-red/10 px-4 py-2 text-sm font-semibold text-swin-red transition hover:bg-swin-red/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Delete
        </button>

          {/*Cancel and Save Function */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-swin-charcoal/20 px-4 py-2 text-sm font-semibold text-swin-charcoal transition hover:bg-swin-charcoal/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Cancel
            </button>
            <DialogSubmitButton />
          </div>
        </div>

        </form>
      </div>
    </div>
  );
}

function ActionFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;

  const tone =
    state.status === 'success'
      ? 'text-emerald-600'
      : state.status === 'error'
      ? 'text-swin-red'
      : 'text-swin-charcoal';

  return <p className={clsx('text-sm font-medium', tone)}>{state.message}</p>;
}

function DialogSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-md bg-swin-red px-4 py-2 text-sm font-semibold text-swin-ivory transition focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-swin-charcoal/20"
    >
      {pending ? 'Saving...' : 'Save changes'}
    </button>
  );
}
