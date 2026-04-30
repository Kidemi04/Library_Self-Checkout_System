'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import PlaceHoldButton from './placeHoldButton';
import ManageCopiesModal from './manageCopiesModal';
import { Pagination } from '@/app/ui/dashboard/pagination';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import BlurFade from '@/app/ui/magicUi/blurFade';
import type { CategoryKey } from '@/app/ui/dashboard/bookCategories';

// ---- Category filter ----
// Screenshot categories: All / Computing / Design / Psychology / Self-help / History
// Plus existing Business & Engineering kept so older data still filters.
type BookCategory =
  | 'Computing'
  | 'Design'
  | 'Business'
  | 'Engineering'
  | 'Psychology'
  | 'Self-help'
  | 'History';

const TAG_CATEGORY_MAP: Record<string, BookCategory> = {
  // Computing
  'machine learning': 'Computing', 'software development': 'Computing',
  'computer science': 'Computing', 'algorithms': 'Computing',
  'data science': 'Computing', 'programming': 'Computing',
  'web development': 'Computing', 'database management': 'Computing',
  'computer networks': 'Computing', 'network protocols': 'Computing',
  'software engineering': 'Computing', 'computer programming': 'Computing',
  'information security': 'Computing', 'distributed systems': 'Computing',
  'parallel computing': 'Computing', 'scripting': 'Computing',
  'software architecture': 'Computing', 'software design': 'Computing',
  'data visualization': 'Computing', 'information visualization': 'Computing',
  'computer graphics': 'Computing', 'internet technology': 'Computing',
  'information systems': 'Computing', 'intelligent systems': 'Computing',
  'predictive analytics': 'Computing', 'programming languages': 'Computing',
  'automation': 'Computing', 'pytorch': 'Computing',
  'information technology': 'Computing', 'cybersecurity': 'Computing',
  'artificial intelligence': 'Computing',

  // Business
  'organizational behavior': 'Business', 'business statistics': 'Business',
  'financial markets': 'Business', 'business economics': 'Business',
  'accounting': 'Business', 'business ethics': 'Business',
  'marketing management': 'Business', 'consumer behavior': 'Business',
  'managerial accounting': 'Business', 'strategic management': 'Business',
  'business administration': 'Business', 'global finance': 'Business',
  'global trade': 'Business', 'banking': 'Business',
  'project management': 'Business', 'product development': 'Business',
  'innovation': 'Business', 'presentation skills': 'Business',
  'portfolio development': 'Business', 'workshop': 'Business',
  'finance': 'Business', 'economics': 'Business', 'marketing': 'Business',

  // Design
  'ux design': 'Design', 'human computer interaction': 'Design',
  'user experience': 'Design', 'visual arts': 'Design',
  'web design': 'Design', 'interface design': 'Design',
  'drawing': 'Design', 'design principles': 'Design',
  'design thinking': 'Design', 'art and design': 'Design',
  'usability engineering': 'Design', 'user experience design': 'Design',
  'multimedia': 'Design', 'graphic design': 'Design',

  // Engineering
  'electronics': 'Engineering', 'circuit analysis': 'Engineering',
  'robotics': 'Engineering', 'control systems': 'Engineering',
  'materials science': 'Engineering', 'engineering mathematics': 'Engineering',
  'applied mathematics': 'Engineering', 'applied thermodynamics': 'Engineering',
  'engineering physics': 'Engineering', 'bioengineering': 'Engineering',
  'differential equations': 'Engineering', 'automatic control': 'Engineering',
  'applied statistics': 'Engineering', 'statistical models': 'Engineering',
  'mechatronics': 'Engineering', 'mechanical engineering': 'Engineering',
  'electrical engineering': 'Engineering', 'civil engineering': 'Engineering',

  // Psychology
  'psychology': 'Psychology', 'cognitive psychology': 'Psychology',
  'behavioural science': 'Psychology', 'behavioral science': 'Psychology',
  'neuroscience': 'Psychology', 'decision making': 'Psychology',
  'behavioral economics': 'Psychology',

  // Self-help
  'self-help': 'Self-help', 'self help': 'Self-help', 'productivity': 'Self-help',
  'habits': 'Self-help', 'personal development': 'Self-help',
  'leadership': 'Self-help', 'mindfulness': 'Self-help',

  // History
  'history': 'History', 'world history': 'History', 'historical fiction': 'History',
  'ancient history': 'History', 'modern history': 'History', 'biography': 'History',
};

const CATEGORY_KEY_TO_LABEL: Record<Exclude<CategoryKey, 'all'>, BookCategory> = {
  computing: 'Computing',
  design: 'Design',
  business: 'Business',
  engineering: 'Engineering',
  psychology: 'Psychology',
  'self-help': 'Self-help',
  history: 'History',
};

const getBookCategory = (book: UIBook): BookCategory | null => {
  if (book.category) {
    const direct = book.category.trim();
    if (direct) {
      const normalized = direct.toLowerCase();
      if (normalized === 'computer science' || normalized === 'computing') return 'Computing';
      if (normalized === 'art & design' || normalized === 'art and design' || normalized === 'design') return 'Design';
      if (normalized === 'business') return 'Business';
      if (normalized === 'engineering') return 'Engineering';
      if (normalized === 'psychology') return 'Psychology';
      if (normalized === 'self-help' || normalized === 'self help') return 'Self-help';
      if (normalized === 'history') return 'History';
    }
  }
  for (const tag of book.tags ?? []) {
    const cat = TAG_CATEGORY_MAP[tag.toLowerCase()];
    if (cat) return cat;
  }
  return null;
};

/** SIP-aligned item status (match your Supabase column) */
export type ItemStatus =
  | 'available'
  | 'checked_out'
  | 'on_hold'
  | 'reserved'
  | 'maintenance';

export type UIBook = {
  id: string;
  title: string;
  author: string;
  cover?: string | null;
  tags?: string[] | null;
  category?: string | null;
  classification?: string | null;
  isbn?: string | null;
  year?: string | number | null;
  publisher?: string | null;
  status?: ItemStatus | null;
  copies_available?: number | null;
  total_copies?: number | null;
  copies_on_loan?: number | null;
};

type Props = {
  books: UIBook[];
  variant?: 'grid' | 'list';
  patronId?: string;
  isStaff?: boolean;
  category?: CategoryKey;
  onDetailsClick?: (book: UIBook) => void;
  pageSize?: number;
};

const STATUS_META: Record<
  ItemStatus,
  { label: string; canBorrow: boolean }
> = {
  available:   { label: 'Available',   canBorrow: true },
  checked_out: { label: 'Checked out', canBorrow: false },
  on_hold:     { label: 'On hold',     canBorrow: false },
  reserved:    { label: 'Reserved',    canBorrow: false },
  maintenance: { label: 'Maintenance', canBorrow: false },
};

function AvailabilityChip({
  available,
  total,
  status,
}: {
  available: number | null | undefined;
  total: number | null | undefined;
  status: ItemStatus;
}) {
  const avail = available ?? 0;
  const tot = total ?? 0;
  if (tot === 0) {
    return (
      <span className="inline-flex rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-white/60">
        No copies
      </span>
    );
  }
  if (avail > 0) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
        {avail} avail.
      </span>
    );
  }
  // No copies free — show On loan (red) per design
  if (status === 'on_hold') {
    return (
      <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
        On hold
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-swin-red/10 px-2.5 py-0.5 text-[11px] font-semibold text-swin-red dark:bg-swin-red/20">
      On loan
    </span>
  );
}

export default function BookList({
  books,
  variant = 'grid',
  patronId,
  isStaff = false,
  category,
  pageSize,
}: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [managingBookId, setManagingBookId] = React.useState<string | null>(null);
  const managingBook = managingBookId ? books.find((b) => b.id === managingBookId) : null;

  const filteredBooks = React.useMemo(() => {
    if (!category || category === 'all') return books;
    const target = CATEGORY_KEY_TO_LABEL[category];
    return books.filter((b) => getBookCategory(b) === target);
  }, [books, category]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const booksPerPage =
    pageSize ?? (variant === 'grid' ? 18 : 8);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage,
  );

  if (!books?.length) return <EmptyState />;

  if (variant === 'grid') {
    return (
      <>
        <BlurFade
          delay={0.2}
          yOffset={10}
          className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          {paginatedBooks.map((b, idx) => {
            const status = (b.status ?? 'available') as ItemStatus;
            const meta = STATUS_META[status] ?? STATUS_META.available;
            const canBorrow = meta.canBorrow && (b.copies_available ?? 1) > 0;
            const noCopies = (b.total_copies ?? 0) === 0;
            const hasCover = !!b.cover;

            return (
              <BlurFade key={b.id} delay={0.2 + idx * 0.03} yOffset={10}>
                <article className="group flex flex-col gap-3">
                  <Link
                    href={canBorrow ? `/dashboard/book/checkout?bookId=${b.id}` : `#`}
                    aria-label={`View ${b.title}`}
                    className="block"
                  >
                    {hasCover ? (
                      <div className="relative overflow-hidden rounded-[10px] shadow-md transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.cover!}
                          alt=""
                          className="aspect-[2/3] w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="transition duration-300 group-hover:-translate-y-0.5 group-hover:[filter:drop-shadow(0_14px_24px_rgba(0,0,0,0.15))]">
                        <BookCover
                          gradient={getBookGradient(b.id)}
                          title={b.title}
                          author={b.author}
                          w={200}
                          h={286}
                          radius={6}
                        />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                      {b.title}
                    </h3>
                    <p className="mt-0.5 truncate font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
                      {b.author || 'Unknown author'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <AvailabilityChip
                        available={b.copies_available}
                        total={b.total_copies}
                        status={status}
                      />
                      {!canBorrow && !noCopies && (
                        <PlaceHoldButton bookId={b.id} patronId={patronId} bookTitle={b.title} />
                      )}
                      {isStaff && (
                        <button
                          type="button"
                          onClick={() => setManagingBookId(b.id)}
                          title="Manage copies"
                          className="rounded-full border border-swin-charcoal/10 px-2.5 py-0.5 text-[10px] font-semibold text-swin-charcoal/60 transition hover:border-swin-charcoal/25 hover:text-swin-charcoal dark:border-white/10 dark:text-white/60 dark:hover:text-white"
                        >
                          Copies
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </BlurFade>
            );
          })}
        </BlurFade>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {isStaff && (
          <ManageCopiesModal
            bookId={managingBookId ?? ''}
            bookTitle={managingBook?.title ?? ''}
            isOpen={managingBookId !== null}
            onClose={() => setManagingBookId(null)}
            onChanged={() => router.refresh()}
          />
        )}
      </>
    );
  }

  // List variant
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
        <ul className="divide-y divide-swin-charcoal/8 dark:divide-white/8">
          {paginatedBooks.map((b, idx) => {
            const status = (b.status ?? 'available') as ItemStatus;
            const meta = STATUS_META[status] ?? STATUS_META.available;
            const canBorrow = meta.canBorrow && (b.copies_available ?? 1) > 0;
            const noCopies = (b.total_copies ?? 0) === 0;

            return (
              <BlurFade key={b.id} delay={0.15 + idx * 0.03} yOffset={8}>
                <li
                  className={clsx(
                    'flex items-center gap-4 px-4 py-3 transition',
                    idx % 2 === 1 && 'bg-slate-50/40 dark:bg-white/[0.02]',
                  )}
                >
                  {b.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.cover}
                      alt=""
                      className="h-16 w-12 flex-shrink-0 rounded object-cover ring-1 ring-swin-charcoal/10 dark:ring-white/10"
                    />
                  ) : (
                    <BookCover gradient={getBookGradient(b.id)} w={48} h={64} radius={3} />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-[15px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                      {b.title}
                    </h3>
                    <p className="truncate font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
                      {b.author || 'Unknown author'}
                      {b.year ? <span className="ml-2 font-mono not-italic text-swin-charcoal/40 dark:text-white/40">· {b.year}</span> : null}
                    </p>
                  </div>
                  <AvailabilityChip
                    available={b.copies_available}
                    total={b.total_copies}
                    status={status}
                  />
                  <div className="flex items-center gap-2">
                    {!canBorrow && !noCopies && (
                      <PlaceHoldButton bookId={b.id} patronId={patronId} bookTitle={b.title} />
                    )}
                    {canBorrow && (
                      <Link
                        href={`/dashboard/book/checkout?bookId=${b.id}`}
                        className="rounded-full bg-swin-charcoal px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-swin-red dark:bg-white dark:text-swin-charcoal dark:hover:bg-swin-red dark:hover:text-white"
                      >
                        Borrow
                      </Link>
                    )}
                    {isStaff && (
                      <button
                        type="button"
                        onClick={() => setManagingBookId(b.id)}
                        className="rounded-full border border-swin-charcoal/10 px-3 py-1 text-[11px] font-semibold text-swin-charcoal/65 transition hover:border-swin-charcoal/25 hover:text-swin-charcoal dark:border-white/10 dark:text-white/60 dark:hover:text-white"
                      >
                        Copies
                      </button>
                    )}
                  </div>
                </li>
              </BlurFade>
            );
          })}
        </ul>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {isStaff && (
        <ManageCopiesModal
          bookId={managingBookId ?? ''}
          bookTitle={managingBook?.title ?? ''}
          isOpen={managingBookId !== null}
          onClose={() => setManagingBookId(null)}
          onChanged={() => router.refresh()}
        />
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-swin-charcoal/15 bg-white p-10 text-center text-[13px] text-swin-charcoal/60 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/60">
      No books match your search. Try a different keyword or clear filters.
    </div>
  );
}
