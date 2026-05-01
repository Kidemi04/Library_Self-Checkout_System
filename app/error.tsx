'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas p-8 text-center dark:bg-dark-canvas">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/15">
        <ExclamationTriangleIcon className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-3">
        <h1 className="font-display text-display-md text-ink tracking-tight dark:text-on-dark">
          Oops, something went wrong
        </h1>
        <p className="max-w-md font-sans text-body-sm text-muted dark:text-on-dark-soft">
          An unexpected error occurred. You can try again or return to the home page.
        </p>
        {error.digest && (
          <p className="font-mono text-code text-muted-soft dark:text-on-dark-soft">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-10 items-center gap-2 rounded-btn bg-primary px-5 font-sans text-button text-on-primary transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-btn border border-hairline bg-surface-card px-5 font-sans text-button text-ink transition hover:bg-surface-cream-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong dark:focus-visible:ring-offset-dark-canvas"
        >
          <HomeIcon className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
