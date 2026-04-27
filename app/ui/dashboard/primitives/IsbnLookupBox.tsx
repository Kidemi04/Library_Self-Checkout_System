'use client';
import clsx from 'clsx';

export default function IsbnLookupBox({
  value, onChange, onLookup, onScan, pending,
}: {
  value: string;
  onChange: (v: string) => void;
  onLookup: () => void;
  onScan: () => void;
  pending: boolean;
}) {
  const cleaned = value.replace(/[-\s]/g, '');
  const isbnValid = /^\d{10}$|^\d{13}$|^\d{9}X$|^\d{12}X$/.test(cleaned);

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Enter ISBN (10 or 13 digits)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-[14rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
      <button
        type="button"
        onClick={onLookup}
        disabled={!isbnValid || pending}
        className={clsx(
          'rounded-lg px-4 py-2 text-sm font-semibold transition',
          (!isbnValid || pending)
            ? 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/5 dark:text-white/40'
            : 'bg-swin-charcoal text-white hover:bg-swin-charcoal/90 dark:bg-emerald-600 dark:hover:bg-emerald-500',
        )}
      >
        {pending ? 'Looking up…' : 'Lookup'}
      </button>
      <button
        type="button"
        onClick={onScan}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
      >
        Scan ISBN
      </button>
    </div>
  );
}
