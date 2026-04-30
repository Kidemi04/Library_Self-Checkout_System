import Link from 'next/link';
import { MagnifyingGlassIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-canvas p-8 text-center dark:bg-dark-canvas">
      {/* 404 number */}
      <div className="select-none">
        <span className="font-display text-[8rem] font-extrabold leading-none tracking-tight text-primary opacity-20">
          404
        </span>
      </div>

      <div className="-mt-6 space-y-3">
        <h1 className="font-display text-display-md text-ink tracking-tight dark:text-on-dark">
          Page not found
        </h1>
        <p className="max-w-sm font-sans text-body-sm text-muted dark:text-on-dark-soft">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center gap-2 rounded-btn bg-primary px-5 font-sans text-button text-on-primary transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
        >
          <HomeIcon className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          href="/dashboard/book/items"
          className="inline-flex h-10 items-center gap-2 rounded-btn border border-hairline bg-surface-card px-5 font-sans text-button text-ink transition hover:bg-surface-cream-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:bg-dark-surface-strong dark:focus-visible:ring-offset-dark-canvas"
        >
          <MagnifyingGlassIcon className="h-4 w-4" />
          Browse Books
        </Link>
      </div>
    </div>
  );
}
