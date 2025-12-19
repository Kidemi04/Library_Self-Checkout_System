import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

const buttonBaseClass =
	'rounded-xl border px-5 py-1.5 text-sm font-medium ' +
  'text-slate-800 bg-white border-slate-200 shadow-sm ' +
  'dark:text-slate-200 dark:bg-slate-900 dark:border-slate-700 ' +
  'hover:text-slate-500 dark:hover:text-slate-400 ' +
	'disabled:opacity-50 disabled:cursor-not-allowed';

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
  return (
    <div className="mx-auto flex w-fit items-center gap-4">
      {/* Previous */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={buttonBaseClass}
        aria-label="Previous page"
      >
        <ChevronDoubleLeftIcon className="h-6 w-6" />
      </button>

      {/* Page indicator */}
      <span className="text-sm text-black dark:text-white/80">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={buttonBaseClass}
        aria-label="Next page"
      >
        <ChevronDoubleRightIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
