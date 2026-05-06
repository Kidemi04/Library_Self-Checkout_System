'use client';

import { useMemo, useState } from 'react';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import type { Book } from '@/app/lib/supabase/types';
import {
  type AssociationRule,
  type Recommendation,
  buildAssociationRules,
  recommendBooks,
  tokenizeInterests,
} from '@/app/ui/dashboard/recommendations/recommender';

type RecommendationLabProps = {
  books: Book[];
};

const defaultHashtags = ['#ai', '#data', '#coding', '#design', '#leadership', '#sustainability'];

const cleanToken = (token: string) => (token.startsWith('#') ? token.slice(1) : token).trim();

const mergeInterestText = (current: string, addition: string) => {
  const combined = new Set([...tokenizeInterests(current), ...tokenizeInterests(addition)]);
  return Array.from(combined).join(', ');
};

const formatScore = (value: number) => value.toFixed(1);

const toTitle = (value: string | null | undefined) => value ?? 'Untitled';

const TagChip = ({ label }: { label: string }) => (
  <span className="rounded-pill border border-hairline dark:border-dark-hairline bg-surface-cream-strong dark:bg-dark-surface-strong px-3 py-1 font-sans text-body-sm font-semibold text-ink/80 dark:text-on-dark/80">
    {label}
  </span>
);

const ReasonList = ({ reasons }: { reasons: string[] }) => (
  <ul className="mt-2 space-y-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">
    {reasons.slice(0, 3).map((reason) => (
      <li key={reason} className="flex items-start gap-2">
        <BoltIcon className="h-4 w-4 flex-none text-primary dark:text-dark-primary" />
        <span>{reason}</span>
      </li>
    ))}
  </ul>
);

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const { book, score, reasons } = recommendation;
  const tags = (book.tags ?? []).slice(0, 4);
  const loanedOut = Math.max(0, (book.totalCopies ?? 0) - (book.availableCopies ?? 0));

  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-5 transition hover:border-primary/20 dark:hover:border-dark-primary/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
            Recommendation
          </p>
          <h3 className="mt-1 font-display text-title-lg text-ink dark:text-on-dark">{toTitle(book.title)}</h3>
          <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
            {book.author ?? 'Unknown author'}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-pill bg-primary/10 px-3 py-1 font-sans text-body-sm font-semibold text-primary dark:bg-dark-primary/15 dark:text-dark-primary">
          <SparklesIcon className="h-4 w-4" />
          {formatScore(score)}
        </span>
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </div>
      ) : null}

      <ReasonList reasons={reasons} />

      <div className="mt-2 flex flex-wrap items-center gap-3 font-sans text-body-sm text-muted dark:text-on-dark-soft">
        <span className="rounded-pill bg-surface-cream-strong dark:bg-dark-surface-strong px-2.5 py-1 font-semibold">
          {book.availableCopies ?? 0} available
        </span>
        <span className="rounded-pill bg-surface-cream-strong dark:bg-dark-surface-strong px-2.5 py-1 font-semibold">
          {loanedOut} on loan
        </span>
        {book.publicationYear ? (
          <span className="rounded-pill bg-surface-cream-strong dark:bg-dark-surface-strong px-2.5 py-1 font-semibold">
            {book.publicationYear}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const AssociationPills = ({
  associations,
  interestTokens,
}: {
  associations: Record<string, AssociationRule[]>;
  interestTokens: string[];
}) => {
  const derived = interestTokens.flatMap((token) =>
    (associations[token] ?? []).map((rule) => ({ source: token, rule })),
  );

  if (!derived.length) {
    return (
      <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
        Add 1-3 interests to see related tags discovered from your catalogue.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {derived.slice(0, 10).map(({ source, rule }) => (
        <span
          key={`${source}-${rule.tag}`}
          className="inline-flex items-center gap-2 rounded-pill border border-hairline dark:border-dark-hairline bg-surface-cream-strong dark:bg-dark-surface-strong px-3 py-1 font-sans text-body-sm font-semibold text-ink/80 dark:text-on-dark/80"
        >
          <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary dark:bg-dark-primary/15 dark:text-dark-primary">
            {source}
          </span>
          <span>{rule.tag}</span>
          <span className="text-[10px] font-semibold text-muted dark:text-on-dark-soft">
            conf {(rule.confidence * 100).toFixed(0)}% | lift {rule.lift.toFixed(2)}
          </span>
        </span>
      ))}
    </div>
  );
};

export default function RecommendationLab({ books }: RecommendationLabProps) {
  const [interests, setInterests] = useState('AI literacy, customer experience, leadership');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [favorNew, setFavorNew] = useState(false);
  const [favorPopular, setFavorPopular] = useState(true);

  const associationRules = useMemo(() => buildAssociationRules(books), [books]);
  const quickHashtags = useMemo(() => {
    const counts = new Map<string, number>();
    books.forEach((book) => {
      (book.tags ?? []).forEach((tag) => {
        const key = tag.trim().toLowerCase();
        if (!key) return;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });

    const sortedTags = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => (tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '-')}`));

    const seen = new Set<string>();
    const uniqueTags = sortedTags.filter((tag) => {
      const lower = tag.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    return uniqueTags.length ? uniqueTags.slice(0, 6) : defaultHashtags;
  }, [books]);

  const interestTokensRaw = useMemo(() => tokenizeInterests(interests), [interests]);
  const interestTokens = useMemo(
    () => interestTokensRaw.map(cleanToken).filter(Boolean),
    [interestTokensRaw],
  );
  const displayTokens = interestTokensRaw.length ? interestTokensRaw : interestTokens;

  const recommendations = useMemo(
    () =>
      recommendBooks(
        books,
        interests,
        { onlyAvailable, favorNew, favorPopular, limit: 12 },
        associationRules,
      ),
    [associationRules, books, favorNew, favorPopular, interests, onlyAvailable],
  );

  const aiPrototypeMatches = useMemo(() => {
    const hasAi = interestTokens.some((token) => token.toLowerCase() === 'ai');
    if (!hasAi) return [];
    return books
      .filter((book) => {
        const inTitle = (book.title ?? '').toLowerCase().includes('ai');
        const inTags = (book.tags ?? []).some((tag) => tag.toLowerCase().includes('ai'));
        return inTitle || inTags;
      })
      .slice(0, 4);
  }, [books, interestTokens]);
  const derivedAssociations = useMemo(
    () => {
      const map = new Map<string, { source: string; rule: AssociationRule }>();
      interestTokens.forEach((token) => {
        (associationRules[token] ?? []).forEach((rule) => {
          if (!map.has(rule.tag)) {
            map.set(rule.tag, { source: token, rule });
          }
        });
      });
      return Array.from(map.values())
        .sort(
          (a, b) => b.rule.lift * b.rule.confidence - a.rule.lift * a.rule.confidence,
        )
        .slice(0, 6);
    },
    [associationRules, interestTokens],
  );

const contentClass =
"inline-flex items-center gap-2 rounded-pill px-3 py-1 font-sans text-body-sm font-semibold " +
"bg-surface-cream-strong text-ink " +
"dark:bg-dark-surface-strong dark:text-on-dark/80"

  return (
    <div className="space-y-6">
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className={contentClass}>
          <SparklesIcon className="h-4 w-4" />
          Content + circulation blend
        </span>
        <span className={contentClass}>
          <LightBulbIcon className="h-4 w-4" />
          Association rules expand your tags
        </span>
      </div>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                  Describe your interests
                </p>
                <h3 className="mt-1 font-display text-display-sm text-ink dark:text-on-dark">
                  What should we recommend?
                </h3>
              </div>
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-muted-soft dark:text-on-dark-soft" />
            </div>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Example: data visualization, climate tech, leadership coaching"
              className="mt-3 w-full rounded-btn border border-hairline dark:border-dark-hairline bg-canvas dark:bg-dark-surface-soft px-3.5 py-2 font-sans text-body-md text-ink dark:text-on-dark placeholder:text-muted-soft dark:placeholder:text-on-dark-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
              rows={3}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {quickHashtags.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInterests((prev) => mergeInterestText(prev, prompt))}
                  className="rounded-pill border border-hairline dark:border-dark-hairline px-3 py-1 font-sans text-body-sm font-semibold text-ink dark:text-on-dark transition hover:border-primary/40 hover:text-primary dark:hover:border-dark-primary/50 dark:hover:text-dark-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 font-sans text-body-sm font-semibold text-ink dark:text-on-dark">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/40 dark:border-dark-hairline dark:text-dark-primary"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                Only show available copies
              </label>
              <label className="flex items-center gap-2 font-sans text-body-sm font-semibold text-ink dark:text-on-dark">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/40 dark:border-dark-hairline dark:text-dark-primary"
                  checked={favorPopular}
                  onChange={(e) => setFavorPopular(e.target.checked)}
                />
                Boost popular picks
              </label>
              <label className="flex items-center gap-2 font-sans text-body-sm font-semibold text-ink dark:text-on-dark">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-hairline text-primary focus:ring-primary/40 dark:border-dark-hairline dark:text-dark-primary"
                  checked={favorNew}
                  onChange={(e) => setFavorNew(e.target.checked)}
                />
                Boost newer titles
              </label>
            </div>

            <div className="mt-4 rounded-card border border-dashed border-primary/40 bg-primary/5 p-4 font-sans text-body-md text-ink dark:border-dark-primary/40 dark:bg-dark-primary/10 dark:text-on-dark">
              <p className="font-sans text-caption-uppercase font-semibold text-primary dark:text-dark-primary">
                Prototype
              </p>
              <p className="mt-1 font-sans text-body-md">
                Type <span className="font-semibold">AI</span> in the box to instantly pull AI-related books as a demo.
              </p>

              {aiPrototypeMatches.length ? (
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {aiPrototypeMatches.map((book) => (
                    <div
                      key={book.id}
                      className="rounded-card border border-primary/20 bg-surface-card px-3 py-2 font-sans text-body-sm font-semibold text-ink dark:border-dark-primary/30 dark:bg-dark-surface-card dark:text-on-dark"
                    >
                      <p className="line-clamp-2">{toTitle(book.title)}</p>
                      <p className="font-sans text-caption font-medium text-muted dark:text-on-dark-soft">
                        {book.author ?? 'Unknown author'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 font-sans text-body-sm text-muted dark:text-on-dark-soft">
                  Waiting for an <strong>AI</strong> keyword to show demo results.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-sans text-title-md font-semibold text-ink dark:text-on-dark">Recommendations</h4>
              <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                Showing {Math.min(recommendations.length, 12)} of {books.length}
              </p>
            </div>
            {recommendations.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.book.id} recommendation={rec} />
                ))}
              </div>
            ) : (
          <div className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6 font-sans text-body-md text-muted dark:text-on-dark-soft">
                No matching books yet. Try broader interests or disable the availability filter.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6">
            <div className="flex items-center gap-2 text-ink dark:text-on-dark">
              <LightBulbIcon className="h-5 w-5 text-primary dark:text-dark-primary" />
              <h4 className="font-sans text-title-md font-semibold">Association rule boosters</h4>
            </div>
            <p className="mt-2 font-sans text-body-sm text-muted dark:text-on-dark-soft">
              We look at tag co-occurrence across your catalogue. If you ask for "AI ethics", we also consider tags
              often paired with it (e.g., privacy, governance, automation) and bump books that share them.
            </p>
            <div className="mt-3">
              <AssociationPills associations={associationRules} interestTokens={interestTokens} />
            </div>
          </div>

          <div className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6">
            <div className="flex items-center gap-2 text-ink dark:text-on-dark">
              <SparklesIcon className="h-5 w-5 text-primary dark:text-dark-primary" />
              <h4 className="font-sans text-title-md font-semibold">Personalized snapshot</h4>
            </div>
            <p className="mt-2 font-sans text-body-sm text-muted dark:text-on-dark-soft">
              A quick, dummy view of the signals driving your recommendations. Use it to show stakeholders how the AI blends your inputs with catalogue context.
            </p>

            <div className="mt-4">
              <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                Your interests
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {displayTokens.length ? (
                  displayTokens.slice(0, 6).map((token) => (
                    <span
                      key={token}
                      className="inline-flex items-center gap-2 rounded-pill bg-primary/10 px-3 py-1 font-sans text-body-sm font-semibold text-primary dark:bg-dark-primary/15 dark:text-dark-primary"
                    >
                      {token}
                    </span>
                  ))
                ) : (
                  <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                    Start typing a topic to see the AI wire up signals.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                AI adds
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {derivedAssociations.length ? (
                  derivedAssociations.map(({ source, rule }) => (
                    <span
                      key={`${source}-${rule.tag}`}
                      className="inline-flex items-center gap-2 rounded-pill border border-hairline dark:border-dark-hairline bg-surface-cream-strong dark:bg-dark-surface-strong px-3 py-1 font-sans text-body-sm font-semibold text-ink/80 dark:text-on-dark/80"
                    >
                      <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-[10px] uppercase text-primary dark:bg-dark-primary/15 dark:text-dark-primary">
                        {source}
                      </span>
                      <span>{rule.tag}</span>
                      <span className="text-[10px] font-semibold text-muted dark:text-on-dark-soft">
                        conf {(rule.confidence * 100).toFixed(0)}% | lift {rule.lift.toFixed(2)}
                      </span>
                    </span>
                  ))
                ) : (
                  <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                    No associated tags yet. Add one or two more interests.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-card bg-surface-cream-strong dark:bg-dark-surface-strong px-3 py-2">
              <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                Filters applied
              </p>
              <div className="mt-2 flex flex-wrap gap-2 font-sans text-body-sm font-semibold text-ink dark:text-on-dark">
                <span className="rounded-pill border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card px-3 py-1">
                  {onlyAvailable ? 'Available copies only' : 'Include on-loan items'}
                </span>
                <span className="rounded-pill border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card px-3 py-1">
                  {favorPopular ? 'Boost popular picks' : 'Neutral popularity'}
                </span>
                <span className="rounded-pill border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card px-3 py-1">
                  {favorNew ? 'Favor newer titles' : 'Any publication year'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card p-6">
            <div className="flex items-center gap-2 text-ink dark:text-on-dark">
              <SparklesIcon className="h-5 w-5 text-primary dark:text-dark-primary" />
              <h4 className="font-sans text-title-md font-semibold">How scoring works</h4>
            </div>
            <ul className="mt-2 space-y-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">
              <li>+3 for tags that exactly match your interests, +2 for associated tags.</li>
              <li>+1.5 when your keywords appear in the title, author, or classification.</li>
              <li>+1 for copies currently available; optional boosts for newer or popular items.</li>
              <li>Ties break alphabetically so you always get a stable list.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
