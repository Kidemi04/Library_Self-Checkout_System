import Link from 'next/link';
import { SparklesIcon, ExclamationTriangleIcon, HashtagIcon } from '@heroicons/react/24/outline';
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
import DevToGrid from '@/app/ui/dashboard/learning/devToGrid';

// ─── Constants ────────────────────────────────────────────────────────────────

const YT_QUICK_FILTERS = [
  { label: 'Engineering',        query: 'engineering' },
  { label: 'Computer Science',   query: 'computer science' },
  { label: 'Cyber Security',     query: 'cyber security' },
  { label: 'Data Science',       query: 'data science' },
  { label: 'Business & Finance', query: 'business finance' },
  { label: 'Design',             query: 'design' },
];

const DEVTO_TAGS = [
  { label: 'All',            value: '',                emoji: '✨' },
  { label: 'Programming',    value: 'programming',     emoji: '💻' },
  { label: 'Computer Sci.',  value: 'computerscience', emoji: '🖥️' },
  { label: 'Data Science',   value: 'datascience',     emoji: '📊' },
  { label: 'Cyber Security', value: 'security',        emoji: '🔒' },
  { label: 'Cloud',          value: 'cloud',           emoji: '☁️' },
  { label: 'Engineering',    value: 'engineering',     emoji: '⚙️' },
  { label: 'AI / ML',        value: 'machinelearning', emoji: '🤖' },
  { label: 'Design',         value: 'ux',              emoji: '🎨' },
  { label: 'Career',         value: 'career',          emoji: '📈' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDifficulty = (v?: string): YouTubeLevel | 'ALL' => {
  if (!v) return 'ALL';
  const n = v.trim().toUpperCase();
  if (n === 'BEGINNER' || n === 'INTERMEDIATE' || n === 'ADVANCED') return n as YouTubeLevel;
  return 'ALL';
};

const buildYtHref = (query: string, difficulty: YouTubeLevel | 'ALL') => {
  const p = new URLSearchParams({ view: 'youtube' });
  p.set('q', query);
  if (difficulty && difficulty !== 'ALL') p.set('difficulty', difficulty);
  return `/dashboard/learning/youtube?${p.toString()}`;
};

const difficultyLabel = (v: YouTubeLevel | 'ALL') => {
  if (!v || v === 'ALL') return 'All levels';
  if (v === 'BEGINNER') return 'Beginner';
  if (v === 'INTERMEDIATE') return 'Intermediate';
  if (v === 'ADVANCED') return 'Advanced';
  return v;
};

async function fetchDevToArticles(tag: string) {
  try {
    const url = tag
      ? `https://dev.to/api/articles?top=30&per_page=18&tag=${encodeURIComponent(tag)}`
      : `https://dev.to/api/articles?top=30&per_page=18`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LearningHubPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : {};

  // Shared
  const view = typeof params?.view === 'string' ? params.view : 'youtube';
  const isYouTube = view !== 'community';

  // YouTube params
  const queryParam   = typeof params?.q === 'string' ? params.q : '';
  const difficulty   = parseDifficulty(typeof params?.difficulty === 'string' ? params.difficulty : undefined);
  const trimmedQuery = queryParam.trim();

  // Dev.to params
  const activeTag = typeof params?.tag === 'string' ? params.tag : '';
  const tagMeta   = DEVTO_TAGS.find((t) => t.value === activeTag) ?? DEVTO_TAGS[0];

  // Fetch only what's needed for the active tab
  const learningStatus = isYouTube ? await getLearningStatus() : null;

  const [searchResult, trendingResult] = isYouTube && trimmedQuery
    ? [await searchLearningCourses({ query: trimmedQuery, limit: 12, difficulty }), null]
    : isYouTube
    ? [null, await getLearningTrending({ limit: 12, difficulty })]
    : [null, null];

  const devToArticles = !isYouTube ? await fetchDevToArticles(activeTag) : [];

  // Tab link builder
  const ytTab  = `/dashboard/learning/youtube?view=youtube`;
  const comTab = `/dashboard/learning/youtube?view=community`;

  return (
    <AdminShell
      titleSubtitle="Online learning resources"
      title="Learning Hub"
      description="Search YouTube tutorials or browse trending dev articles — all in one place."
    >
      <ScrollUnlock />
      <div className="space-y-8">

        {/* ── Tab switcher ── */}
        <div className="flex w-full max-w-sm overflow-hidden rounded-full border border-swin-charcoal/10 bg-swin-charcoal/5 p-1 dark:border-white/10 dark:bg-white/5">
          <Link
            href={ytTab}
            className={`flex-1 rounded-full py-2 text-center text-sm font-semibold transition-all ${
              isYouTube
                ? 'bg-swin-red text-white shadow-sm'
                : 'text-swin-charcoal/60 hover:text-swin-charcoal dark:text-white/50 dark:hover:text-white'
            }`}
          >
            🎬 YouTube
          </Link>
          <Link
            href={comTab}
            className={`flex-1 rounded-full py-2 text-center text-sm font-semibold transition-all ${
              !isYouTube
                ? 'bg-swin-red text-white shadow-sm'
                : 'text-swin-charcoal/60 hover:text-swin-charcoal dark:text-white/50 dark:hover:text-white'
            }`}
          >
            📖 Community
          </Link>
        </div>

        {/* ════════════════════════════════════════════════
            YOUTUBE TAB
        ════════════════════════════════════════════════ */}
        {isYouTube && (
          <>
            {/* Demo mode notice */}
            {learningStatus?.usingStub && (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
                <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <p>
                  <span className="font-semibold">Demo mode —</span> showing sample video data. Add{' '}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">YOUTUBE_API_KEY</code>{' '}
                  to <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">.env.local</code> for live data.
                </p>
              </div>
            )}

            <YouTubeSearchForm defaults={{ query: trimmedQuery, difficulty }} />

            {/* Quick topics */}
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/50 dark:text-white/60">Quick topics</p>
              <div className="flex flex-wrap gap-2">
                {YT_QUICK_FILTERS.map((f) => (
                  <Link
                    key={f.label}
                    href={buildYtHref(f.query, difficulty)}
                    className="rounded-full border border-swin-charcoal/10 px-4 py-2 text-sm font-medium text-swin-charcoal transition hover:border-swin-red hover:text-swin-red dark:border-white/20 dark:text-white"
                  >
                    {f.label}
                  </Link>
                ))}
              </div>
            </section>

            {/* Results / trending */}
            {trimmedQuery ? (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-400">Search results</p>
                    <h2 className="text-xl font-semibold text-swin-charcoal dark:text-white">
                      {searchResult?.items.length ?? 0} video{(searchResult?.items.length ?? 0) === 1 ? '' : 's'} for &ldquo;{trimmedQuery}&rdquo;
                    </h2>
                  </div>
                  <div className="rounded-full border border-swin-charcoal/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal/70 dark:border-white/10 dark:text-white/70">
                    YouTube
                  </div>
                </div>
                <p className="text-sm text-swin-charcoal/60 dark:text-slate-300/80">
                  Difficulty: <span className="font-semibold text-swin-charcoal dark:text-white">{difficultyLabel(difficulty)}</span>
                </p>
                {searchResult?.error && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                    {searchResult.error}
                  </div>
                )}
                <SearchResultsPanel items={searchResult?.items ?? []} query={trimmedQuery} />
              </section>
            ) : (
              <section className="space-y-8">
                <div className="flex items-center gap-3 text-swin-charcoal dark:text-white">
                  <SparklesIcon className="h-6 w-6 text-swin-red" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/60 dark:text-slate-400">Trending</p>
                    <h2 className="text-xl font-semibold">Trending learning videos</h2>
                  </div>
                </div>
                {trendingResult?.error && (
                  <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                    {trendingResult.error}
                  </div>
                )}
                <SearchResultsPanel items={trendingResult?.items ?? []} query="TRENDING" autoScroll={false} />
              </section>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════
            COMMUNITY BITES TAB
        ════════════════════════════════════════════════ */}
        {!isYouTube && (
          <>
            {/* Tag filters */}
            <div className="flex flex-wrap items-center gap-2">
              <HashtagIcon className="h-4 w-4 flex-shrink-0 text-swin-charcoal/40 dark:text-white/40" />
              {DEVTO_TAGS.map((tag) => (
                <Link
                  key={tag.value}
                  href={`/dashboard/learning/youtube?view=community&tag=${tag.value}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeTag === tag.value
                      ? 'bg-swin-red text-white shadow-sm shadow-swin-red/30'
                      : 'bg-swin-charcoal/5 text-swin-charcoal hover:bg-swin-red/10 hover:text-swin-red dark:bg-white/5 dark:text-white dark:hover:text-swin-red'
                  }`}
                >
                  {tag.emoji} {tag.label}
                </Link>
              ))}
            </div>

            {/* Post count divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-swin-charcoal/10 dark:bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-widest text-swin-charcoal/40 dark:text-white/40">
                {tagMeta.emoji} {devToArticles.length} trending posts
              </span>
              <div className="h-px flex-1 bg-swin-charcoal/10 dark:bg-white/10" />
            </div>

            {/* Masonry grid with pop-up panel */}
            {devToArticles.length > 0 ? (
              <DevToGrid articles={devToArticles} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-swin-charcoal/20 bg-white p-12 text-center dark:border-white/20 dark:bg-slate-900/40">
                <p className="text-swin-charcoal/50 dark:text-white/50">No articles could be loaded right now.</p>
                <p className="mt-1 text-xs text-swin-charcoal/30 dark:text-white/30">Try switching to a different topic above.</p>
              </div>
            )}

            <p className="text-center text-[11px] text-swin-charcoal/30 dark:text-white/25">
              Powered by{' '}
              <a href="https://dev.to" target="_blank" rel="noopener noreferrer" className="underline hover:text-swin-red">
                DEV Community
              </a>
            </p>
          </>
        )}

      </div>
    </AdminShell>
  );
}
