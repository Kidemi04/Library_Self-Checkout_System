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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <ExclamationTriangleIcon className="h-8 w-8 text-swin-red" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Something went wrong
        </h2>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl bg-swin-red px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <ArrowPathIcon className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
