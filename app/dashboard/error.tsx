'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
        <ExclamationTriangleIcon className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-display-sm text-ink dark:text-on-dark">
          Something went wrong
        </h2>
        <p className="max-w-sm font-sans text-body-sm text-muted dark:text-on-dark-soft">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="font-mono text-code text-muted-soft dark:text-on-dark-soft">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="inline-flex h-10 items-center gap-2 rounded-btn bg-primary px-5 font-sans text-button text-on-primary transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
      >
        <ArrowPathIcon className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
