import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, QrCodeIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchBookById } from '@/app/lib/supabase/queries';
import AdminShell from '@/app/ui/dashboard/adminShell';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import PlaceHoldButton from '@/app/ui/dashboard/placeHoldButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: PageProps) {
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  const { id } = await params;
  const book = await fetchBookById(id);
  if (!book) notFound();

  const available = book.availableCopies ?? 0;
  const total = book.totalCopies ?? book.copies.length;
  const onLoan = (book.copies ?? []).filter((c) => c.status === 'on_loan').length;
  const canBorrow = available > 0;

  const tags = book.tags ?? [];

  return (
    <>
      <title>{`${book.title} | Swinburne Library`}</title>
      <AdminShell
        titleSubtitle="Book detail"
        title={book.title}
        description={book.author ? `by ${book.author}` : undefined}
        primaryAction={
          <Link
            href="/dashboard/book/items"
            className="inline-flex items-center gap-1.5 rounded-xl border border-swin-charcoal/15 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-swin-charcoal/80 transition hover:border-swin-charcoal/30 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white/80"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to catalogue
          </Link>
        }
      >
        <div className="grid gap-8 md:grid-cols-[260px,1fr]">
          {/* Cover column */}
          <div>
            {book.coverImageUrl ? (
              <div className="overflow-hidden rounded-xl shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImageUrl}
                  alt={`Cover of ${book.title}`}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            ) : (
              <BookCover
                gradient={getBookGradient(book.id)}
                title={book.title}
                author={book.author ?? 'Unknown'}
                w={260}
                h={372}
                radius={12}
              />
            )}
          </div>

          {/* Details column */}
          <div className="flex flex-col gap-5">
            {/* Availability + actions */}
            <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/50 dark:text-white/50">
                    Availability
                  </p>
                  <p className="mt-1 font-display text-[20px] font-semibold text-swin-charcoal dark:text-white">
                    {available} of {total} available
                  </p>
                  {onLoan > 0 && (
                    <p className="mt-0.5 text-[12px] text-swin-charcoal/55 dark:text-white/55">
                      {onLoan} on loan
                    </p>
                  )}
                </div>
                <span
                  className={
                    canBorrow
                      ? 'rounded-full bg-emerald-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'rounded-full bg-rose-100 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                  }
                >
                  {canBorrow ? 'Available' : 'On loan'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {canBorrow ? (
                  <Link
                    href={`/dashboard/book/checkout?bookId=${book.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-swin-red px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-swin-red/90"
                  >
                    <QrCodeIcon className="h-4 w-4" />
                    Borrow this book
                  </Link>
                ) : (
                  <PlaceHoldButton bookId={book.id} patronId={user.id} bookTitle={book.title} />
                )}
                <Link
                  href="/dashboard/book/items"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-swin-charcoal/15 bg-white px-3.5 py-2.5 text-[13px] font-semibold text-swin-charcoal/80 transition hover:border-swin-charcoal/30 dark:border-white/15 dark:bg-swin-dark-surface dark:text-white/80"
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Browse more
                </Link>
              </div>
            </div>

            {/* Metadata */}
            <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-swin-charcoal/10 bg-white p-5 font-mono text-[11px] dark:border-white/10 dark:bg-swin-dark-surface sm:grid-cols-2">
              {book.isbn && (
                <div>
                  <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
                    ISBN
                  </dt>
                  <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">{book.isbn}</dd>
                </div>
              )}
              {book.classification && (
                <div>
                  <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
                    Call number
                  </dt>
                  <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
                    {book.classification}
                  </dd>
                </div>
              )}
              {book.publisher && (
                <div>
                  <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
                    Publisher
                  </dt>
                  <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
                    {book.publisher}
                  </dd>
                </div>
              )}
              {book.publicationYear && (
                <div>
                  <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
                    Year
                  </dt>
                  <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
                    {book.publicationYear}
                  </dd>
                </div>
              )}
              {book.category && (
                <div>
                  <dt className="uppercase tracking-wider text-swin-charcoal/45 dark:text-white/45">
                    Category
                  </dt>
                  <dd className="mt-0.5 text-swin-charcoal/85 dark:text-white/85">
                    {book.category}
                  </dd>
                </div>
              )}
            </dl>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-swin-charcoal/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-swin-charcoal/75 dark:bg-white/10 dark:text-white/75"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Copies (staff/admin only) */}
            {(user.role === 'staff' || user.role === 'admin') && book.copies.length > 0 && (
              <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface">
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/55 dark:text-white/55">
                  Copies ({book.copies.length})
                </p>
                <ul className="space-y-1.5">
                  {book.copies.map((copy) => (
                    <li
                      key={copy.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-swin-charcoal/10 px-3 py-2 text-[12px] dark:border-white/10"
                    >
                      <span className="font-mono text-swin-charcoal/75 dark:text-white/75">
                        {copy.barcode}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-swin-charcoal/55 dark:text-white/55">
                        {copy.status.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </AdminShell>
    </>
  );
}
