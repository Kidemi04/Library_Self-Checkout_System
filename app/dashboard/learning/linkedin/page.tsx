import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';
import {
  getLearningStatus,
  getLearningCollections,
  searchLearningCourses,
} from '@/app/lib/learning/service';
import type { LinkedInLearningLevel, LinkedInLearningTopicDefinition } from '@/app/lib/linkedin/types';
import LinkedInLearningSearchForm from '@/app/ui/dashboard/learning/searchForm';
import SearchResultsPanel from '@/app/ui/dashboard/learning/searchResultsPanel';
import CollectionsPanel from '@/app/ui/dashboard/learning/collectionsPanel';
import AdminShell from '@/app/ui/dashboard/adminShell';

// LinkedIn Learning — professional & tech skills focus
const linkedInTopics: LinkedInLearningTopicDefinition[] = [
  { key: 'software-dev', title: 'Software Development', query: 'programming software web development', description: 'Web development, APIs, mobile apps, and software engineering fundamentals.' },
  { key: 'data-ai', title: 'Data Science & AI', query: 'machine learning data science artificial intelligence', description: 'Python, ML, data analysis, and artificial intelligence foundations.' },
  { key: 'cloud-devops', title: 'Cloud & DevOps', query: 'cloud AWS Azure DevOps kubernetes', description: 'Cloud platforms, containers, CI/CD pipelines, and infrastructure.' },
  { key: 'business', title: 'Business & Leadership', query: 'leadership management project business', description: 'Project management, leadership, communication, and business strategy.' },
  { key: 'design', title: 'Design & Creative', query: 'UX UI design creative Figma', description: 'UI/UX, graphic design, Figma, and creative production tools.' },
];

const linkedInQuickFilters = [
  { label: 'Python', query: 'python' },
  { label: 'Machine Learning', query: 'machine learning' },
  { label: 'Cloud', query: 'cloud computing AWS' },
  { label: 'Project Management', query: 'project management' },
  { label: 'UX Design', query: 'UX design' },
  { label: 'JavaScript', query: 'javascript react' },
];

// Khan Academy — academic subjects focus (used as fallback)
const khanTopics: LinkedInLearningTopicDefinition[] = [
  { key: 'computer-science', title: 'Computer Science & Programming', query: 'programming algorithms', description: 'Coding fundamentals, algorithms, HTML, SQL and more.' },
  { key: 'mathematics', title: 'Mathematics', query: 'calculus statistics mathematics', description: 'From algebra and calculus to statistics and linear algebra.' },
  { key: 'science', title: 'Science', query: 'biology chemistry physics', description: 'University-level biology, chemistry and physics.' },
  { key: 'humanities', title: 'Humanities', query: 'history art grammar', description: 'World history, art history, grammar and writing skills.' },
  { key: 'economics', title: 'Economics & Finance', query: 'economics finance microeconomics', description: 'Micro and macroeconomics, personal finance, and AP economics.' },
];

const khanQuickFilters = [
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
  return `/dashboard/learning/linkedin?${params.toString()}`;
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

  // Determine which provider is active
  const learningStatus = await getLearningStatus();
  const isLinkedIn = learningStatus.provider === 'linkedin';
  const providerLabel = learningStatus.label;

  const curatedTopics = isLinkedIn ? linkedInTopics : khanTopics;
  const quickFilters = isLinkedIn ? linkedInQuickFilters : khanQuickFilters;

  const [searchResult, collections] = trimmedQuery
    ? [
        await searchLearningCourses({ query: trimmedQuery, limit: 12, difficulty }),
        [],
      ]
    : [
        null,
        await getLearningCollections(curatedTopics, { limitPerTopic: 4, difficulty }),
      ];

  const titleDescription = isLinkedIn
    ? 'Access professional courses in technology, business, creative skills, and more — powered by LinkedIn Learning for Swinburne students.'
    : 'Explore free courses across computer science, mathematics, science, humanities, and economics — curated from Khan Academy for Swinburne students.';

  return (
    <AdminShell
      titleSubtitle="Online learning resources"
      title={providerLabel}
      description={titleDescription}
    >
      <div className="space-y-8">
      <LinkedInLearningSearchForm
        defaults={{ query: trimmedQuery, difficulty }}
        providerLabel={providerLabel}
      />

      <section className="space-y-3">
        <p className="font-sans text-caption-uppercase tracking-[0.3em] text-muted dark:text-on-dark-soft">Quick topics</p>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Link
              key={filter.label}
              href={buildSearchHref(filter.query, difficulty)}
              className="rounded-pill border border-hairline bg-surface-card px-4 py-2 font-sans text-body-sm font-medium text-ink transition hover:border-primary/20 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
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
              <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                Search results
              </p>
              <h2 className="font-display text-display-sm text-ink dark:text-on-dark">
                {searchResult?.items.length ?? 0} course{(searchResult?.items.length ?? 0) === 1 ? '' : 's'} for &ldquo;
                {trimmedQuery}&rdquo;
              </h2>
            </div>
            <div className="rounded-pill border border-hairline bg-surface-card px-4 py-1 font-sans text-caption-uppercase text-muted dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft">
              {providerLabel}
            </div>
          </div>
          <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
            Difficulty filter:{' '}
            <span className="font-semibold text-ink dark:text-on-dark">{difficultyLabel(difficulty)}</span>
          </p>
          {searchResult?.error ? (
            <div className="rounded-card border border-warning/30 bg-warning/10 px-4 py-3 font-sans text-body-sm text-warning">
              {searchResult.error}
            </div>
          ) : null}
          <SearchResultsPanel items={searchResult?.items ?? []} query={trimmedQuery} />
        </section>
      ) : (
        <section className="space-y-8">
          <div className="flex items-center gap-3 text-ink dark:text-on-dark">
            <SparklesIcon className="h-6 w-6 text-primary" />
            <div>
              <p className="font-sans text-caption-uppercase tracking-[0.3em] text-muted dark:text-on-dark-soft">
                Curated collections
              </p>
              <h2 className="font-display text-display-sm">Highlighted topics for you</h2>
              <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                Browse spotlight playlists. Select a card to open the course on {providerLabel}.
              </p>
            </div>
          </div>
          <CollectionsPanel
            collections={collections}
            difficulty={difficulty}
          />
        </section>
      )}
      </div>
    </AdminShell>
  );
}
