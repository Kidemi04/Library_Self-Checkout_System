import Link from 'next/link';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-swin-ivory dark:bg-swin-dark-bg p-8 text-center">
      {/* 404 number */}
      <div className="select-none">
        <span className="text-[8rem] font-extrabold leading-none tracking-tight text-swin-red opacity-20">
          404
        </span>
      </div>

      <div className="-mt-6 space-y-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-swin-red px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <HomeIcon className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          href="/dashboard/book/items"
          className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          Browse Books
        </Link>
      </div>
    </div>
  );
}
