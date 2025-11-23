'use client';

import { useMemo, useState } from 'react';
import {
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
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

const quickPrompts = [
  'AI ethics & automation in libraries',
  'Digital transformation & UX design',
  'Leadership and team coaching',
  'Climate fiction & sustainability',
  'Data storytelling and visualization',
  'Community building & social impact',
];

const mergeInterestText = (current: string, addition: string) => {
  const combined = new Set([...tokenizeInterests(current), ...tokenizeInterests(addition)]);
  return Array.from(combined).join(', ');
};

const formatScore = (value: number) => value.toFixed(1);

const toTitle = (value: string | null | undefined) => value ?? 'Untitled';

const TagChip = ({ label }: { label: string }) => (
  <span className="rounded-full border border-swin-charcoal/10 bg-slate-50 px-3 py-1 text-xs font-semibold text-swin-charcoal/80 dark:border-white/10 dark:bg-slate-900/50 dark:text-white/80">
    {label}
  </span>
);

const ReasonList = ({ reasons }: { reasons: string[] }) => (
  <ul className="mt-2 space-y-1 text-xs text-swin-charcoal/70 dark:text-slate-300/80">
    {reasons.slice(0, 3).map((reason) => (
      <li key={reason} className="flex items-start gap-2">
        <BoltIcon className="h-4 w-4 flex-none text-swin-red dark:text-emerald-300" />
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
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-swin-charcoal/10 bg-white p-5 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-swin-charcoal/60 dark:text-slate-300/70">
            Recommendation
          </p>
          <h3 className="mt-1 text-lg font-semibold text-swin-charcoal dark:text-white">{toTitle(book.title)}</h3>
          <p className="text-sm text-swin-charcoal/70 dark:text-slate-300/80">
            {book.author ?? 'Unknown author'}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-swin-red/10 px-3 py-1 text-xs font-semibold text-swin-red dark:bg-emerald-500/10 dark:text-emerald-200">
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

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-swin-charcoal/70 dark:text-slate-300/80">
        <span className="rounded-full bg-swin-charcoal/5 px-2.5 py-1 font-semibold dark:bg-white/10">
          {book.availableCopies ?? 0} available
        </span>
        <span className="rounded-full bg-swin-charcoal/5 px-2.5 py-1 font-semibold dark:bg-white/10">
          {loanedOut} on loan
        </span>
        {book.publicationYear ? (
          <span className="rounded-full bg-swin-charcoal/5 px-2.5 py-1 font-semibold dark:bg-white/10">
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
      <p className="text-xs text-swin-charcoal/70 dark:text-slate-300/80">
        Add 1-3 interests to see related tags discovered from your catalogue.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {derived.slice(0, 10).map(({ source, rule }) => (
        <span
          key={`${source}-${rule.tag}`}
          className="inline-flex items-center gap-2 rounded-full border border-swin-charcoal/10 bg-slate-50 px-3 py-1 text-xs font-semibold text-swin-charcoal/80 dark:border-white/10 dark:bg-slate-900/50 dark:text-white/80"
        >
          <span className="rounded-full bg-swin-red/10 px-2 py-0.5 text-[10px] uppercase text-swin-red dark:bg-emerald-500/10 dark:text-emerald-200">
            {source}
          </span>
          <span>{rule.tag}</span>
          <span className="text-[10px] font-semibold text-swin-charcoal/60 dark:text-slate-300/70">
            conf {(rule.confidence * 100).toFixed(0)}% · lift {rule.lift.toFixed(2)}
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

  const interestTokens = useMemo(() => tokenizeInterests(interests), [interests]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-swin-charcoal/10 bg-gradient-to-r from-swin-charcoal via-swin-red to-[#3b0b14] p-8 text-white shadow-2xl shadow-swin-red/30">
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Recommendation lab</p>
        <h2 className="mt-3 text-2xl font-semibold">AI-powered book picks</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/80">
          Enter what you want to learn or explore. We score your catalogue using content signals,
          simple association rules between tags, and circulation heat to surface relevant titles.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/75">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold">
            <SparklesIcon className="h-4 w-4" />
            Content + circulation blend
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold">
            <LightBulbIcon className="h-4 w-4" />
            Association rules expand your tags
          </span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-swin-charcoal/60 dark:text-slate-300/70">
                  Describe your interests
                </p>
                <h3 className="mt-1 text-lg font-semibold text-swin-charcoal dark:text-white">
                  What should we recommend?
                </h3>
              </div>
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-swin-charcoal/50 dark:text-slate-300/70" />
            </div>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Example: data visualization, climate tech, leadership coaching"
              className="mt-3 w-full rounded-xl border border-swin-charcoal/10 bg-slate-50 px-4 py-3 text-sm text-swin-charcoal shadow-inner focus:border-swin-red focus:outline-none dark:border-white/10 dark:bg-slate-900/50 dark:text-white"
              rows={3}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInterests((prev) => mergeInterestText(prev, prompt))}
                  className="rounded-full border border-swin-charcoal/10 px-3 py-1 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red hover:text-swin-red dark:border-white/10 dark:text-white dark:hover:border-emerald-300/60 dark:hover:text-emerald-200"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-swin-charcoal dark:text-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-swin-charcoal/20 text-swin-red focus:ring-swin-red"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                Only show available copies
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-swin-charcoal dark:text-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-swin-charcoal/20 text-swin-red focus:ring-swin-red"
                  checked={favorPopular}
                  onChange={(e) => setFavorPopular(e.target.checked)}
                />
                Boost popular picks
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-swin-charcoal dark:text-white">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-swin-charcoal/20 text-swin-red focus:ring-swin-red"
                  checked={favorNew}
                  onChange={(e) => setFavorNew(e.target.checked)}
                />
                Boost newer titles
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-swin-charcoal dark:text-white">Recommendations</h4>
              <p className="text-xs text-swin-charcoal/70 dark:text-slate-300/80">
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
              <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-sm text-swin-charcoal/70 shadow-sm dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300/80">
                No matching books yet. Try broader interests or disable the availability filter.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 text-swin-charcoal dark:text-white">
              <LightBulbIcon className="h-5 w-5 text-swin-red dark:text-emerald-200" />
              <h4 className="text-sm font-semibold">Association rule boosters</h4>
            </div>
            <p className="mt-2 text-xs text-swin-charcoal/70 dark:text-slate-300/80">
              We look at tag co-occurrence across your catalogue. If you ask for "AI ethics", we also consider tags
              often paired with it (e.g., privacy, governance, automation) and bump books that share them.
            </p>
            <div className="mt-3">
              <AssociationPills associations={associationRules} interestTokens={interestTokens} />
            </div>
          </div>

          <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 text-swin-charcoal dark:text-white">
              <SparklesIcon className="h-5 w-5 text-swin-red dark:text-emerald-200" />
              <h4 className="text-sm font-semibold">How scoring works</h4>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-swin-charcoal/70 dark:text-slate-300/80">
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
