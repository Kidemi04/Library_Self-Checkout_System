import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { getKhanAcademyCollections, searchKhanAcademyCourses } from '@/app/lib/khan/service';
import type { LinkedInLearningLevel, LinkedInLearningTopicDefinition } from '@/app/lib/linkedin/types';
import LinkedInLearningCourseCard from '@/app/ui/dashboard/learning/courseCard';
import LinkedInLearningSearchForm from '@/app/ui/dashboard/learning/searchForm';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';

const curatedTopics: LinkedInLearningTopicDefinition[] = [
  { key: 'computer-science', title: 'Computer Science & Programming', query: 'programming algorithms', description: 'Coding fundamentals, algorithms, HTML, SQL and more.' },
  { key: 'mathematics', title: 'Mathematics', query: 'calculus statistics mathematics', description: 'From algebra and calculus to statistics and linear algebra.' },
  { key: 'science', title: 'Science', query: 'biology chemistry physics', description: 'University-level biology, chemistry and physics.' },
  { key: 'humanities', title: 'Humanities', query: 'history art grammar', description: 'World history, art history, grammar and writing skills.' },
  { key: 'economics', title: 'Economics & Finance', query: 'economics finance microeconomics', description: 'Micro and macroeconomics, personal finance, and AP economics.' },
];

const quickFilters = [
  { label: 'Algorithms', query: 'algorithms' },
  { label: 'Statistics', query: 'statistics' },
  { label: 'Web development', query: 'html css programming' },
  { label: 'Economics', query: 'economics' },
  { label: 'Biology', query: 'biology' },
  { label: 'Calculus', query: 'calculus' },
];

const parseDifficulty = (value: string | undefined): LinkedInLearningLevel | 'ALL' => {
  if (!value) return 'ALL';
  const normalized = value.trim().toUpperCase();
  if (normalized === 'BEGINNER' || normalized === 'INTERMEDIATE' || normalized === 'ADVANCED') {
    return normalized as LinkedInLearningLevel;
  }
  return 'ALL';
};

const buildSearchHref = (query: string, difficulty: LinkedInLearningLevel | 'ALL') => {
  const params = new URLSearchParams();
  params.set('q', query);
  if (difficulty && difficulty !== 'ALL') {
    params.set('difficulty', difficulty);
  }
  return `/dashboard/learning?${params.toString()}`;
};

const difficultyLabel = (value: LinkedInLearningLevel | 'ALL') => {
  if (!value || value === 'ALL') return 'All levels';
  if (value === 'BEGINNER') return 'Beginner';
  if (value === 'INTERMEDIATE') return 'Intermediate';
  if (value === 'ADVANCED') return 'Advanced';
  return value;
};

export default async function LinkedInLearningPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : {};
  const queryParam = typeof params?.q === 'string' ? params.q : '';
  const difficulty = parseDifficulty(typeof params?.difficulty === 'string' ? params.difficulty : undefined);

  const trimmedQuery = queryParam.trim();

  const [searchResult, collections] = trimmedQuery
    ? [
        await searchKhanAcademyCourses({
          query: trimmedQuery,
          limit: 12,
          difficulty,
        }),
        [],
      ]
    : [
        null,
        await getKhanAcademyCollections(curatedTopics, {
          limitPerTopic: 4,
          difficulty,
        }),
      ];

  return (
    <main className="space-y-8">
      <DashboardTitleBar
        subtitle="Free learning resources"
        title="Khan Academy"
        description="Explore free courses across computer science, mathematics, science, humanities, and economics — curated from Khan Academy for Swinburne students."
      />

      <section className="rounded-3xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-300/80">About this resource</p>
        <h2 className="mt-2 text-lg font-semibold text-swin-charcoal dark:text-white">Free courses by Khan Academy</h2>
        <p className="mt-2 text-sm text-swin-charcoal/70 dark:text-slate-300/80">
          All courses are free and open to everyone. Click any card to open the course directly on Khan Academy. No account required for most content.
        </p>
      </section>

      <LinkedInLearningSearchForm
        defaults={{
          query: trimmedQuery,
          difficulty,
        }}
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
                {searchResult?.items.length ?? 0} course{(searchResult?.items.length ?? 0) === 1 ? '' : 's'} for "
                {trimmedQuery}"
              </h2>
            </div>
            <div className="rounded-full border border-swin-charcoal/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal/70 dark:border-white/10 dark:text-white/70">
              Khan Academy
            </div>
          </div>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-300/80">
            Difficulty filter: <span className="font-semibold text-swin-charcoal dark:text-white">{difficultyLabel(difficulty)}</span>
          </p>
          {searchResult?.error ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
              {searchResult.error}
            </div>
          ) : null}
          {searchResult && searchResult.items.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {searchResult.items.map((course) => (
                <LinkedInLearningCourseCard key={course.urn} course={course} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-swin-charcoal/20 bg-white p-8 text-center text-sm text-swin-charcoal/70 dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-300/80">
              No courses found for this topic. Try the search form above.
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-swin-charcoal dark:text-white">
            <SparklesIcon className="h-6 w-6 text-swin-red" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-swin-charcoal/60 dark:text-slate-400">
                Curated collections
              </p>
              <h2 className="text-xl font-semibold">Highlighted topics for your team</h2>
              <p className="text-sm text-swin-charcoal/70 dark:text-slate-300/80">
                Browse spotlight playlists. Select a card to open the course inside Khan Academy.
              </p>
            </div>
          </div>
          {collections.map(({ definition, result }) => (
            <div
              key={definition.key}
              className="space-y-4 rounded-3xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-400">
                    Spotlight topic
                  </p>
                  <h3 className="text-lg font-semibold text-swin-charcoal dark:text-white">{definition.title}</h3>
                  {definition.description ? (
                    <p className="text-sm text-swin-charcoal/70 dark:text-slate-300/80">{definition.description}</p>
                  ) : null}
                </div>
                <Link
                  href={buildSearchHref(definition.query, difficulty)}
                  className="rounded-full border border-swin-charcoal/10 px-4 py-2 text-sm font-medium text-swin-charcoal transition hover:border-swin-red hover:text-swin-red dark:border-white/20 dark:text-white"
                >
                  Browse all
                </Link>
              </div>
              {result.items.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {result.items.map((course) => (
                    <LinkedInLearningCourseCard key={`${definition.key}-${course.urn}`} course={course} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-swin-charcoal/20 bg-white/40 p-6 text-sm text-swin-charcoal/70 dark:border-white/15 dark:bg-slate-900/30 dark:text-slate-300/80">
                  No courses found for this topic. Try the search form above.
                </div>
              )}
            </div>
          ))}
          {!collections.length ? (
            <div className="rounded-3xl border border-dashed border-swin-charcoal/20 bg-white p-6 text-center text-sm text-swin-charcoal/70 dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-300/80">
              No courses found for this topic. Try the search form above.
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
