'use client'

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFormState, useFormStatus } from 'react-dom';
import { updateBookAction, deleteBookAction } from '@/app/dashboard/actions';
import { initialActionState, type ActionState } from '@/app/dashboard/action-state';
import type { Book, BookStatus } from '@/app/lib/supabase/types';

const statusOptions: Array<{ value: BookStatus; label: string }> = [
  { value: 'available', label: 'Available' },
  { value: 'checked_out', label: 'Checked out' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'maintenance', label: 'Maintenance' },
];

type ManageBookDialogProps = {
  book: Book;
  onClose: () => void;
};

export default function ManageBookDialog({ book, onClose }: ManageBookDialogProps) {
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
    'mt-2 w-full rounded-lg border border-swin-charcoal/20 bg-swin-ivory px-3 py-2 text-sm text-black focus:border-swin-red focus:outline-none focus:ring-0';

  return (
    // Book Manage Forms
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto" 
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) { onClose();}}} >
      
      <div
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-swin-charcoal shadow-xl shadow-swin-charcoal/10" >
        <div className="flex items-start justify-between gap-4">

          {/* Title and Subtitle */}
          <div>
            <h2 className="text-lg font-semibold">Manage book</h2>
            <p className="mt-1 text-sm text-swin-charcoal/60">
              Update catalogue details to keep the inventory accurate.
            </p>
          </div>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-swin-charcoal/20 p-2 text-swin-charcoal transition hover:bg-swin-charcoal/5"
            aria-label="Close manage book dialog" >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Forms */}
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="bookId" value={book.id} />

          {/* Book Title */}
          <div>
            <label className={labelClass} htmlFor="manage-title">
              Title
            </label>
            <input
              id="manage-title"
              name="title"
              defaultValue={book.title}
              className={inputClass}
              required />
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
                className={clsx(inputClass, 'pr-8')}>
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

          <div>
            <label className={labelClass} htmlFor="manage-cover-link">
              Cover Image Link
            </label>
            <input
              id="manage-cover-link"
              name="coverImageUrl"
              defaultValue={book.cover_image_url ?? ""}
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
          className="inline-flex items-center justify-center rounded-md border border-swin-red/30 bg-swin-red/10 px-4 py-2 text-sm font-semibold text-swin-red transition hover:bg-swin-red/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white" >
          Delete
        </button>

          {/*Cancel and Save Function */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md border border-swin-charcoal/20 px-4 py-2 text-sm font-semibold text-swin-charcoal transition hover:bg-swin-charcoal/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white" >
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
