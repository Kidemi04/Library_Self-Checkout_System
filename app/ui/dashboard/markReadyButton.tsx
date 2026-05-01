'use client';

import { useRef, useState } from 'react';

interface Props {
  holdId: string;
  patronId: string;
  bookId: string;
  bookTitle: string;
  action: (formData: FormData) => Promise<void>;
  available?: boolean;
}

export default function MarkReadyButton({ holdId, patronId, bookId, bookTitle, action, available = false }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => available && setOpen(true)}
        disabled={!available}
        title={available ? undefined : 'No copies available — book must be returned first'}
        className={available
          ? 'inline-flex h-9 items-center rounded-btn bg-success px-3 font-sans text-caption-uppercase text-on-dark transition hover:bg-success/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas'
          : 'inline-flex h-9 cursor-not-allowed items-center rounded-btn bg-surface-cream-strong px-3 font-sans text-caption-uppercase text-muted-soft dark:bg-dark-surface-strong dark:text-on-dark-soft'}
      >
        {available ? 'Mark ready' : 'Unavailable'}
      </button>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm dark:bg-dark-canvas/70">
          <div className="w-full max-w-sm rounded-card border border-hairline bg-surface-card p-6 shadow-[0_4px_16px_rgba(20,20,19,0.08)] dark:border-dark-hairline dark:bg-dark-surface-card">
            <h3 className="mb-2 font-display text-display-sm text-ink dark:text-on-dark">
              Confirm hold ready
            </h3>
            <p className="mb-5 font-sans text-body-sm text-body dark:text-on-dark-soft">
              Mark{' '}
              <span className="font-medium text-ink dark:text-on-dark">
                &ldquo;{bookTitle || 'this book'}&rdquo;
              </span>{' '}
              as ready for pickup? A notification will be sent to the patron.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center rounded-btn border border-hairline bg-surface-card px-4 font-sans text-body-sm font-medium text-ink transition hover:bg-surface-cream-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong dark:focus-visible:ring-offset-dark-canvas"
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
                  className="inline-flex h-10 items-center rounded-btn bg-success px-4 font-sans text-body-sm font-semibold text-on-dark transition hover:bg-success/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
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
