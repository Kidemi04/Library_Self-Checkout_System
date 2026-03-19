import Link from 'next/link';
import clsx from 'clsx';
import { InformationCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  getLinkedInLearningCollections,
  getLinkedInLearningStatus,
  searchLinkedInLearningCourses,
} from '@/app/lib/linkedin/service';
import type { LinkedInLearningLevel, LinkedInLearningTopicDefinition } from '@/app/lib/linkedin/types';
import LinkedInLearningCourseCard from '@/app/ui/dashboard/learning/course-card';
import LinkedInLearningSearchForm from '@/app/ui/dashboard/learning/search-form';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';

const curatedTopics: LinkedInLearningTopicDefinition[] = [
  {
    key: 'ai-literacy',
    title: 'AI & Automation for Libraries',
    query: 'ai literacy for librarians',
    description: 'Guides on applying AI responsibly to cataloguing, search, and self-service flows.',
  },
  {
    key: 'experience-design',
    title: 'Experience Design & Service Quality',
    query: 'library customer experience service design',
    description: 'Improve wayfinding, signage, and customer experience for self-checkout spaces.',
  },
  {
    key: 'leadership',
    title: 'Leadership & Upskilling',
    query: 'library leadership team development',
    description: 'Coaching, change enablement, and skill pathways for front-of-house staff.',
  },
];

const quickFilters = [
  { label: 'Digital literacy', query: 'digital literacy essentials' },
  { label: 'Customer experience', query: 'customer experience training' },
  { label: 'Team leadership', query: 'people leadership coaching' },
  { label: 'Project delivery', query: 'agile delivery basics' },
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
  const { user } = await getDashboardSession();
  const role = user?.role ?? 'user';
  const isPrivileged = role === 'staff' || role === 'admin';
  const params = searchParams ? await searchParams : {};
  const queryParam = typeof params?.q === 'string' ? params.q : '';
  const difficulty = parseDifficulty(typeof params?.difficulty === 'string' ? params.difficulty : undefined);

  const trimmedQuery = queryParam.trim();
  const status = isPrivileged ? await getLinkedInLearningStatus() : null;

  const [searchResult, collections] = trimmedQuery
    ? [
        await searchLinkedInLearningCourses({
          query: trimmedQuery,
          limit: 12,
          difficulty,
        }),
        [],
      ]
    : [
        null,
        await getLinkedInLearningCollections(curatedTopics, {
          limitPerTopic: 4,
          difficulty,
        }),
      ];

  return (
    <main className="space-y-8">
      <DashboardTitleBar
        subtitle="Professional learning"
        title="LinkedIn Learning library"
        description="Surface curated LinkedIn Learning courses that complement library services. Search for topics, share
        playlists with staff, or recommend skills to members right from the dashboard."
      />

      {isPrivileged && status ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-300/80">Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  status.enabled
                    ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
                    : 'bg-amber-200/40 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200',
                )}
              >
                {status.enabled ? 'Active' : 'Disabled'}
              </span>
              <span className="rounded-full bg-swin-charcoal/5 px-3 py-1 text-xs font-semibold text-swin-charcoal/80 dark:bg-white/10 dark:text-white">
                {status.usingStub ? 'Sample data' : 'Live API'}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-swin-charcoal/70 dark:text-slate-300/80">Locale</dt>
                <dd className="font-semibold text-swin-charcoal dark:text-white">{status.locale}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-swin-charcoal/70 dark:text-slate-300/80">Organization URN</dt>
                <dd className="font-semibold text-swin-charcoal dark:text-white">
                  {status.organizationUrn ?? 'Not set'}
                </dd>
              </div>
            </dl>
            {status.reason ? (
              <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                {status.reason}
              </p>
            ) : null}
          </div>
          <div className="rounded-3xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-300/80">Resources</p>
            <h2 className="mt-2 text-lg font-semibold text-swin-charcoal dark:text-white">
              Configure LinkedIn Learning API access
            </h2>
            <p className="mt-2 text-sm text-swin-charcoal/70 dark:text-slate-300/80">
              Add your enterprise application credentials to{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs text-swin-charcoal">.env.local</code> and
              grant the learning scopes listed by Microsoft. Visit the docs for endpoint and permission details.
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link
                href="https://learn.microsoft.com/en-us/linkedin/learning/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-swin-red underline-offset-4 hover:underline"
              >
                <InformationCircleIcon className="h-4 w-4" />
                Microsoft Learn: LinkedIn Learning API
              </Link>
            </div>
          </div>
        </section>
      ) : null}

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
                {searchResult?.items.length ?? 0} course{(searchResult?.items.length ?? 0) === 1 ? '' : 's'} for “
                {trimmedQuery}”
              </h2>
            </div>
            <div className="rounded-full border border-swin-charcoal/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal/70 dark:border-white/10 dark:text-white/70">
              {searchResult?.source === 'stub'
                ? 'Sample data'
                : searchResult?.source === 'disabled'
                ? 'Disabled'
                : 'Live API'}
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
              No courses matched that search. Try a broader keyword or different quick topic.
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
                Browse spotlight playlists. Select a card to open the course inside LinkedIn Learning.
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
                  No courses returned for this topic yet. Configure LinkedIn Learning credentials or try the search form.
                </div>
              )}
              {result.source === 'stub' ? (
                <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">
                  Showing bundled sample data until LinkedIn Learning credentials are provided.
                </p>
              ) : null}
            </div>
          ))}
          {!collections.length ? (
            <div className="rounded-3xl border border-dashed border-swin-charcoal/20 bg-white p-6 text-center text-sm text-swin-charcoal/70 dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-300/80">
              Configure LinkedIn Learning credentials to load curated recommendations.
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
