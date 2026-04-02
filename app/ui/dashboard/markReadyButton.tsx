'use client';

import { useRef, useState } from 'react';

interface Props {
  holdId: string;
  patronId: string;
  bookId: string;
  bookTitle: string;
  action: (formData: FormData) => Promise<void>;
}

export default function MarkReadyButton({ holdId, patronId, bookId, bookTitle, action }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
      >
        Mark ready
      </button>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">
              Confirm hold ready
            </h3>
            <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
              Mark{' '}
              <span className="font-medium text-slate-900 dark:text-slate-100">
                &ldquo;{bookTitle || 'this book'}&rdquo;
              </span>{' '}
              as ready for pickup? A notification will be sent to the patron.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              {/* Hidden form that submits the server action */}
              <form ref={formRef} action={action}>
                <input type="hidden" name="holdId" value={holdId} />
                <input type="hidden" name="patronId" value={patronId} />
                <input type="hidden" name="bookId" value={bookId} />
                <input type="hidden" name="bookTitle" value={bookTitle} />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Yes, mark ready
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
