'use client';

import React from 'react';
import Link from 'next/link';
import PlaceHoldButton from './placeHoldButton';
import { Pagination } from '@/app/ui/dashboard/pagination';
import GlassCard from '@/app/ui/magicUi/glassCard';
import BlurFade from '@/app/ui/magicUi/blurFade';

// ---- Category filter ----
type BookCategory = 'Computer Science' | 'Business' | 'Art & Design' | 'Engineering';

const TAG_CATEGORY_MAP: Record<string, BookCategory> = {
  'machine learning': 'Computer Science', 'software development': 'Computer Science',
  'computer science': 'Computer Science', 'algorithms': 'Computer Science',
  'data science': 'Computer Science', 'programming': 'Computer Science',
  'web development': 'Computer Science', 'database management': 'Computer Science',
  'computer networks': 'Computer Science', 'network protocols': 'Computer Science',
  'software engineering': 'Computer Science', 'computer programming': 'Computer Science',
  'information security': 'Computer Science', 'distributed systems': 'Computer Science',
  'parallel computing': 'Computer Science', 'scripting': 'Computer Science',
  'software architecture': 'Computer Science', 'software design': 'Computer Science',
  'data visualization': 'Computer Science', 'information visualization': 'Computer Science',
  'computer graphics': 'Computer Science', 'internet technology': 'Computer Science',
  'information systems': 'Computer Science', 'intelligent systems': 'Computer Science',
  'predictive analytics': 'Computer Science', 'programming languages': 'Computer Science',
  'automation': 'Computer Science', 'pytorch': 'Computer Science',
  'information technology': 'Computer Science', 'cybersecurity': 'Computer Science',
  'artificial intelligence': 'Computer Science',
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
  'ux design': 'Art & Design', 'human computer interaction': 'Art & Design',
  'user experience': 'Art & Design', 'visual arts': 'Art & Design',
  'web design': 'Art & Design', 'interface design': 'Art & Design',
  'drawing': 'Art & Design', 'design principles': 'Art & Design',
  'design thinking': 'Art & Design', 'art and design': 'Art & Design',
  'usability engineering': 'Art & Design', 'user experience design': 'Art & Design',
  'multimedia': 'Art & Design', 'graphic design': 'Art & Design',
  'electronics': 'Engineering', 'circuit analysis': 'Engineering',
  'robotics': 'Engineering', 'control systems': 'Engineering',
  'materials science': 'Engineering', 'engineering mathematics': 'Engineering',
  'applied mathematics': 'Engineering', 'applied thermodynamics': 'Engineering',
  'engineering physics': 'Engineering', 'bioengineering': 'Engineering',
  'differential equations': 'Engineering', 'automatic control': 'Engineering',
  'applied statistics': 'Engineering', 'statistical models': 'Engineering',
  'mechatronics': 'Engineering', 'mechanical engineering': 'Engineering',
  'electrical engineering': 'Engineering', 'civil engineering': 'Engineering',
};

const CATEGORIES: BookCategory[] = ['Computer Science', 'Business', 'Art & Design', 'Engineering'];

const CATEGORY_STYLES: Record<BookCategory, { active: string; inactive: string; tag: string }> = {
  'Computer Science': {
    active: 'bg-blue-600 text-white',
    inactive: 'border border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  'Business': {
    active: 'bg-emerald-600 text-white',
    inactive: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  'Art & Design': {
    active: 'bg-purple-600 text-white',
    inactive: 'border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  'Engineering': {
    active: 'bg-orange-600 text-white',
    inactive: 'border border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-950',
    tag: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
};

const getBookCategory = (book: UIBook): BookCategory | null => {
  // Prefer DB category column
  if (book.category) {
    const cat = CATEGORIES.find((c) => c === book.category);
    if (cat) return cat;
  }
  // Fall back to tag inference
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
  // catalogue metadata (optional)
  classification?: string | null; // call number
  isbn?: string | null;
  year?: string | number | null;  // or publication_year
  publisher?: string | null;
  // availability
  status?: ItemStatus | null;
  copies_available?: number | null;
  total_copies?: number | null;
};

type Props = {
  books: UIBook[];
  variant?: 'grid' | 'list';               // card grid or compact list
  patronId?: string;                       // who is browsing (for holds)
  onDetailsClick?: (book: UIBook) => void; // optional: "View details"
  onBorrowClick?: (book: UIBook) => void;  // optional: "Borrow / Request" (deprecated, use Quick Borrow Link instead)
  pageSize?: number; // optional: number of books per page
};

const STATUS_META: Record<
  ItemStatus,
  { label: string; chip: string; stripe: string; canBorrow: boolean }
> = {
  available: { label: 'Available', chip: 'bg-green-100 text-green-700', stripe: 'bg-green-500/70', canBorrow: true },
  checked_out: { label: 'Checked out', chip: 'bg-amber-100 text-amber-800', stripe: 'bg-amber-500/70', canBorrow: false },
  on_hold: { label: 'On hold', chip: 'bg-violet-100 text-violet-800', stripe: 'bg-violet-500/70', canBorrow: false },
  reserved: { label: 'Reserved', chip: 'bg-blue-100 text-blue-800', stripe: 'bg-blue-500/70', canBorrow: false },
  maintenance: { label: 'Maintenance', chip: 'bg-slate-200 text-slate-700', stripe: 'bg-slate-400/70', canBorrow: false },
};

export default function BookList({
  books,
  variant = 'grid',
  patronId,
  pageSize,
}: Props) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedCategory, setSelectedCategory] = React.useState<BookCategory | null>(null);

  const filteredBooks = React.useMemo(() => {
    if (!selectedCategory) return books;
    return books.filter((b) => getBookCategory(b) === selectedCategory);
  }, [books, selectedCategory]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Determine number of books per page based on variant or prop
  const booksPerPage =
    pageSize ?? (variant === 'grid' ? 4 * 4 : 5); // 4 rows of 4 = 16 for grid, 5 for list

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Slice books for current page
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  if (!books?.length) return <EmptyState />;

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    variant === 'grid' ? (
      <BlurFade delay={0.2} yOffset={10} className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
        {children}
      </BlurFade>
    ) : (
      <ul className="divide-y rounded-2xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
        <BlurFade delay={0.2} yOffset={10} className="flex flex-col gap-3">
          {children}
        </BlurFade>
      </ul>
    );

  return (
    <>
      {/* Category filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-swin-charcoal/60 dark:text-slate-400">Filter:</span>
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-swin-charcoal text-white dark:bg-slate-100 dark:text-slate-900'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? CATEGORY_STYLES[cat].active
                : `bg-white dark:bg-slate-900 ${CATEGORY_STYLES[cat].inactive}`
            }`}
          >
            {cat}
          </button>
        ))}
        {selectedCategory && (
          <span className="ml-1 text-xs text-swin-charcoal/50 dark:text-slate-400">
            {filteredBooks.length} book{filteredBooks.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <Wrapper>
        {paginatedBooks.map((b, idx) => {
          const status = (b.status ?? 'available') as ItemStatus;
          const meta = STATUS_META[status] ?? STATUS_META.available;
          const canBorrow = meta.canBorrow && (b.copies_available ?? 1) > 0;
          const showCopies =
            typeof b.copies_available === 'number' && typeof b.total_copies === 'number';

          return (
            <BlurFade key={b.id} delay={0.2 + idx * 0.05} yOffset={10}>
              {variant === 'grid' ? (
                <GlassCard
                  intensity="low"
                  className="rounded-lg group relative flex flex-col overflow-hidden p-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {/* Status Stripe */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${meta.stripe}`} />

                  <div className="p-4 flex-1 flex flex-col gap-3">
                    {/* Header: Cover & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <figure className="relative shrink-0 shadow-md rounded-lg overflow-hidden">
                        {b.cover ? (
                          <img
                            src={b.cover}
                            alt=""
                            aria-hidden
                            className="h-28 w-20 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="h-28 w-20 bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-300 dark:text-white/20">
                            <span className="text-xs">No Cover</span>
                          </div>
                        )}
                      </figure>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm ${meta.chip}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="line-clamp-2 text-sm font-bold text-swin-charcoal dark:text-white leading-tight group-hover:text-swin-red transition-colors">
                        {b.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-swin-charcoal/70 dark:text-slate-400 font-medium">
                        {b.author || 'Unknown author'}
                      </p>

                      {/* Metadata */}
                      <div className="mt-3 flex flex-wrap gap-y-1 gap-x-3 text-[10px] text-swin-charcoal/60 dark:text-slate-500">
                        {b.year && <span>{b.year}</span>}
                        {b.classification && <span>• {b.classification}</span>}
                      </div>

                      {/* Category + tags */}
                      {(() => {
                        const cat = getBookCategory(b);
                        const visibleTags = (b.tags ?? []).slice(0, 2);
                        return (cat || visibleTags.length > 0) ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {cat && (
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${CATEGORY_STYLES[cat].tag}`}>
                                {cat}
                              </span>
                            )}
                            {visibleTags.map((tag) => (
                              <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                      {showCopies && (
                        <div className="text-[10px] font-medium text-swin-charcoal/80 dark:text-slate-400">
                          <span className={b.copies_available && b.copies_available > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-swin-red"}>
                            {b.copies_available}
                          </span>
                          <span className="opacity-60"> / {b.total_copies} left</span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!canBorrow && <PlaceHoldButton bookId={b.id} patronId={patronId} bookTitle={b.title} />}
                        {canBorrow && (
                          <Link
                            href={`/dashboard/book/checkout?bookId=${b.id}`}
                            className="rounded-full bg-swin-charcoal dark:bg-white text-white dark:text-swin-charcoal px-3 py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-swin-red dark:hover:bg-swin-red dark:hover:text-white transition-colors shadow-sm"
                          >
                            Borrow
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard 
                  intensity="low" 
                  className="group relative flex items-center gap-4 p-4 transition-all duration-300 hover:bg-white/50 dark:hover:bg-white/5 overflow-hidden">
                  {/* Status Stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${meta.stripe}`} />

                  <figure className="relative shrink-0 shadow-sm rounded-md overflow-hidden">
                    {b.cover ? (
                      <img src={b.cover} alt="" className="h-16 w-12 object-cover" />
                    ) : (
                      <div className="h-16 w-12 bg-slate-100 dark:bg-white/10" />
                    )}
                  </figure>

                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                    <div className="sm:col-span-2">
                      <h3 className="truncate text-sm font-bold text-swin-charcoal dark:text-white group-hover:text-swin-red transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-xs text-swin-charcoal/70 dark:text-slate-400">
                        {b.author} • {b.year}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
                        {meta.label}
                      </span>
                      {showCopies && (
                        <span className="text-[10px] text-swin-charcoal/60 dark:text-slate-500">
                          {b.copies_available}/{b.total_copies}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      {!canBorrow && <PlaceHoldButton bookId={b.id} patronId={patronId} bookTitle={b.title} />}
                      {canBorrow && (
                        <Link
                          href={`/dashboard/book/checkout?bookId=${b.id}`}
                          className="rounded-full bg-swin-charcoal dark:bg-white text-white dark:text-swin-charcoal px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide hover:bg-swin-red dark:hover:bg-swin-red dark:hover:text-white transition-colors shadow-sm"
                        >
                          Borrow
                        </Link>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )}
            </BlurFade>
          );
        })}
      </Wrapper>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
      <p className="text-sm">
        No books match your search. Try a different keyword or clear filters.
      </p>
    </div>
  );
}
