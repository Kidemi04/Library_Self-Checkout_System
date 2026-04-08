'use client';

import { useState } from 'react';
import { SparklesIcon, BookOpenIcon } from '@heroicons/react/24/outline';

type StageBook = {
  id: string;
  title: string;
  author: string | null;
  availableCopies: number;
  totalCopies: number;
  reason: string;
};

type Stage = {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  books: StageBook[];
};

type LearningPathResponse = {
  ok: boolean;
  topic?: string;
  stages?: Stage[];
  error?: string;
};

const PRESET_TOPICS = [
  'Data Science',
  'Artificial Intelligence',
  'Cybersecurity',
  'Software Engineering',
  'Business Analytics',
  'Robotics',
];

const STAGE_STYLES: Record<Stage['level'], { bg: string; badge: string; number: string }> = {
  Beginner: {
    bg: 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/40',
    badge: 'text-emerald-700 dark:text-emerald-300',
    number: 'bg-swin-red',
  },
  Intermediate: {
    bg: 'bg-amber-50/60 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/40',
    badge: 'text-amber-600 dark:text-amber-300',
    number: 'bg-swin-red',
  },
  Advanced: {
    bg: 'bg-rose-50/60 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/40',
    badge: 'text-rose-700 dark:text-rose-300',
    number: 'bg-swin-red',
  },
};

export default function LearningPathGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LearningPathResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (inputTopic: string) => {
    const t = inputTopic.trim();
    if (!t) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t }),
      });
      const data = (await res.json()) as LearningPathResponse;
      if (!data.ok) {
        setError(data.error ?? 'Failed to generate learning path.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator card */}
      <div className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 text-swin-charcoal dark:text-white">
          <SparklesIcon className="h-5 w-5 text-swin-red" />
          <p className="font-semibold">AI learning path generator</p>
        </div>
        <p className="mt-1 text-sm text-swin-charcoal/60 dark:text-slate-400">
          Enter a topic and the AI will suggest books from the library catalog arranged from beginner to advanced level.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate(topic)}
            placeholder="e.g. Machine Learning, Cybersecurity, Business..."
            className="flex-1 rounded-xl border border-swin-charcoal/20 bg-swin-ivory px-4 py-2 text-sm text-swin-charcoal placeholder-swin-charcoal/40 focus:border-swin-red focus:outline-none dark:border-white/20 dark:bg-slate-800 dark:text-white dark:placeholder-white/30"
          />
          <button
            onClick={() => generate(topic)}
            disabled={loading || !topic.trim()}
            className="rounded-xl bg-swin-red px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {/* Preset chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_TOPICS.map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTopic(preset);
                generate(preset);
              }}
              disabled={loading}
              className="rounded-full border border-swin-charcoal/15 px-3 py-1 text-xs font-medium text-swin-charcoal/70 transition hover:border-swin-red hover:text-swin-red disabled:opacity-40 dark:border-white/20 dark:text-white/60"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      )}

      {/* Results */}
      {result?.stages && (
        <div className="space-y-4">
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
            Learning path for{' '}
            <span className="font-semibold text-swin-charcoal dark:text-white">
              &ldquo;{result.topic}&rdquo;
            </span>
          </p>

          {result.stages.map((stage, stageIndex) => {
            const styles = STAGE_STYLES[stage.level];
            return (
              <div
                key={stage.level}
                className={`rounded-2xl border p-5 ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${styles.number}`}>
                    {stageIndex + 1}
                  </span>
                  <div>
                    <p className={`text-sm font-semibold ${styles.badge}`}>{stage.level}</p>
                    <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">{stage.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {stage.books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-swin-charcoal/10 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/50"
                    >
                      <div className="flex items-start gap-3">
                        <BookOpenIcon className="mt-0.5 h-4 w-4 shrink-0 text-swin-red" />
                        <div>
                          <p className="text-sm font-medium text-swin-charcoal dark:text-white">{book.title}</p>
                          {book.author && (
                            <p className="text-xs text-swin-charcoal/60 dark:text-slate-400">by {book.author}</p>
                          )}
                          <p className="mt-0.5 text-xs text-swin-charcoal/50 dark:text-slate-500">{book.reason}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          book.availableCopies > 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {book.availableCopies > 0 ? `${book.availableCopies} available` : 'On loan'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
