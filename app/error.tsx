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
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-swin-ivory dark:bg-swin-dark-bg p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ExclamationTriangleIcon className="h-10 w-10 text-swin-red" />
      </div>

      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Oops, something went wrong
        </h1>
        <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred. You can try again or return to the home page.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl bg-swin-red px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <HomeIcon className="h-4 w-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
