import Link from 'next/link';
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  getLearningStatus,
  getLearningTrending,
  searchLearningCourses,
} from '@/app/lib/learning/service';
import type { YouTubeLevel } from '@/app/lib/youtube/types';
import YouTubeSearchForm from '@/app/ui/dashboard/learning/searchForm';
import SearchResultsPanel from '@/app/ui/dashboard/learning/searchResultsPanel';
import AdminShell from '@/app/ui/dashboard/adminShell';
import ScrollUnlock from '@/app/ui/dashboard/learning/scrollUnlock';

const quickFilters = [
  { label: 'Python',            query: 'python tutorial' },
  { label: 'Machine Learning',  query: 'machine learning' },
  { label: 'Cloud',             query: 'cloud computing AWS' },
  { label: 'Project Management',query: 'project management' },
  { label: 'UX Design',         query: 'UX design' },
  { label: 'JavaScript',        query: 'javascript react' },
];

const parseDifficulty = (value: string | undefined): YouTubeLevel | 'ALL' => {
  if (!value) return 'ALL';
  const n = value.trim().toUpperCase();
  if (n === 'BEGINNER' || n === 'INTERMEDIATE' || n === 'ADVANCED') return n as YouTubeLevel;
  return 'ALL';
};

const buildSearchHref = (query: string, difficulty: YouTubeLevel | 'ALL') => {
  const params = new URLSearchParams();
  params.set('q', query);
  if (difficulty && difficulty !== 'ALL') params.set('difficulty', difficulty);
  return `/dashboard/learning/youtube?${params.toString()}`;
};

const difficultyLabel = (value: YouTubeLevel | 'ALL') => {
  if (!value || value === 'ALL') return 'All levels';
  if (value === 'BEGINNER') return 'Beginner';
  if (value === 'INTERMEDIATE') return 'Intermediate';
  if (value === 'ADVANCED') return 'Advanced';
  return value;
};

export default async function YouTubeLearningPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : {};
  const queryParam   = typeof params?.q === 'string' ? params.q : '';
  const difficulty   = parseDifficulty(typeof params?.difficulty === 'string' ? params.difficulty : undefined);
  const trimmedQuery = queryParam.trim();

  const learningStatus = await getLearningStatus();

  const [searchResult, trendingResult] = trimmedQuery
    ? [await searchLearningCourses({ query: trimmedQuery, limit: 12, difficulty }), null]
    : [null, await getLearningTrending({ limit: 12, difficulty })];

  return (
    <AdminShell
      titleSubtitle="Online learning resources"
      title="YouTube Learning"
      description="Access educational videos in technology, business, creative skills, and more — curated for Swinburne students."
    >
      <ScrollUnlock />
      <div className="space-y-8">

        {/* Demo mode notice */}
        {learningStatus.usingStub && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
            <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <p>
              <span className="font-semibold">Demo mode —</span> showing sample video data. To connect to the live YouTube Data API, add{' '}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">YOUTUBE_API_KEY</code>{' '}
              to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">.env.local</code>.
            </p>
          </div>
        )}

        <YouTubeSearchForm
          defaults={{ query: trimmedQuery, difficulty }}
        />

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/50 dark:text-white/60">Quick topics</p>
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Link
                key={filter.label}
                href={buildSearchHref(filter.query, difficulty)}
                className="rounded-full border border-swin-charcoal/10 px-4 py-2 text-sm font-medium text-swin-charcoal transition hover:border-swin-red hover:text-swin-red dark:border-white/20 dark:text-white"
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </section>

        {trimmedQuery ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-400">
                  Search results
                </p>
                <h2 className="text-xl font-semibold text-swin-charcoal dark:text-white">
                  {searchResult?.items.length ?? 0} video{(searchResult?.items.length ?? 0) === 1 ? '' : 's'} for &ldquo;
                  {trimmedQuery}&rdquo;
                </h2>
              </div>
              <div className="rounded-full border border-swin-charcoal/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal/70 dark:border-white/10 dark:text-white/70">
                YouTube
              </div>
            </div>
            <p className="text-sm text-swin-charcoal/60 dark:text-slate-300/80">
              Difficulty:{' '}
              <span className="font-semibold text-swin-charcoal dark:text-white">{difficultyLabel(difficulty)}</span>
            </p>
            {searchResult?.error ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                {searchResult.error}
              </div>
            ) : null}
            <SearchResultsPanel items={searchResult?.items ?? []} query={trimmedQuery} />
          </section>
        ) : (
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-swin-charcoal dark:text-white">
              <SparklesIcon className="h-6 w-6 text-swin-red" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/60 dark:text-slate-400">
                  Trending
                </p>
                <h2 className="text-xl font-semibold">Trending learning videos</h2>
                <p className="text-sm text-swin-charcoal/70 dark:text-slate-300/80">
                  Watch directly here â€” no need to open YouTube.
                </p>
              </div>
            </div>
            {trendingResult?.error ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                {trendingResult.error}
              </div>
            ) : null}
            <SearchResultsPanel items={trendingResult?.items ?? []} query="TRENDING" autoScroll={false} />
          </section>
        )}

      </div>
    </AdminShell>
  );
}
