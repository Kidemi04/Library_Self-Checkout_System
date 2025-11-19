import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';

type SearchDefaults = {
  query?: string;
  difficulty?: string;
};

export default function LinkedInLearningSearchForm({ defaults }: { defaults: SearchDefaults }) {
  const query = defaults.query ?? '';
  const difficulty = defaults.difficulty ?? 'ALL';

  return (
    <form
      className="grid gap-4 rounded-3xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60"
      action="/dashboard/learning"
      method="get"
    >
      <label className="text-sm font-medium text-swin-charcoal dark:text-white">
        Search LinkedIn Learning
        <span className="mt-2 flex items-center gap-3 rounded-2xl border border-swin-charcoal/10 bg-swin-charcoal/5 px-4 py-3 text-base dark:border-white/10 dark:bg-white/5">
          <MagnifyingGlassIcon className="h-5 w-5 text-swin-charcoal/60 dark:text-slate-300/80" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Try “self checkout hardware” or “leadership”"
            className="w-full border-none bg-transparent text-base text-swin-charcoal placeholder:text-swin-charcoal/50 focus:outline-none dark:text-white dark:placeholder:text-slate-400"
          />
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_auto] md:items-end">
        <label className="text-sm font-medium text-swin-charcoal dark:text-white">
          Difficulty
          <select
            name="difficulty"
            defaultValue={difficulty}
            className="mt-2 w-full rounded-2xl border border-swin-charcoal/10 bg-white px-4 py-3 text-sm text-swin-charcoal shadow-sm focus:border-swin-red focus:outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-swin-red px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-swin-red/90"
          >
            Search courses
          </button>
          <Link
            href="/dashboard/learning"
            className="rounded-2xl border border-swin-charcoal/15 px-4 py-3 text-sm font-semibold text-swin-charcoal transition hover:border-swin-red hover:text-swin-red dark:border-white/20 dark:text-white dark:hover:text-swin-red"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}
