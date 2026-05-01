'use client';

import { useState } from 'react';
import { SparklesIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';

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
    bg: 'bg-success/10 border-success/30 dark:bg-success/15 dark:border-success/40',
    badge: 'text-success',
    number: 'bg-primary',
  },
  Intermediate: {
    bg: 'bg-warning/10 border-warning/30 dark:bg-warning/15 dark:border-warning/40',
    badge: 'text-warning',
    number: 'bg-primary',
  },
  Advanced: {
    bg: 'bg-primary/10 border-primary/30 dark:bg-dark-primary/15 dark:border-dark-primary/40',
    badge: 'text-primary dark:text-dark-primary',
    number: 'bg-primary',
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
      <div className="rounded-card border border-hairline bg-surface-card p-8 dark:border-dark-hairline dark:bg-dark-surface-card">
        <div className="flex items-center gap-2 text-ink dark:text-on-dark">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <p className="font-sans text-title-md font-semibold">AI learning path generator</p>
        </div>
        <p className="mt-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">
          Enter a topic and the AI will suggest books from the library catalog arranged from beginner to advanced level.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate(topic)}
            placeholder="e.g. Machine Learning, Cybersecurity, Business..."
            className="h-10 flex-1 rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
          />
          <Button
            onClick={() => generate(topic)}
            disabled={loading || !topic.trim()}
            aria-disabled={loading || !topic.trim()}
          >
            {loading ? 'Generating…' : 'Generate'}
          </Button>
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
              className="rounded-pill border border-hairline bg-canvas px-3 py-1 font-sans text-caption font-medium text-muted transition hover:border-primary/20 hover:text-primary disabled:opacity-40 dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark-soft dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-card border border-warning/30 bg-warning/10 px-4 py-3 font-sans text-body-sm text-warning">
          {error}
        </div>
      )}

      {/* Results */}
      {result?.stages && (
        <div className="space-y-4">
          <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
            Learning path for{' '}
            <span className="font-semibold text-ink dark:text-on-dark">
              &ldquo;{result.topic}&rdquo;
            </span>
          </p>

          {result.stages.map((stage, stageIndex) => {
            const styles = STAGE_STYLES[stage.level];
            return (
              <div
                key={stage.level}
                className={`rounded-card border p-5 ${styles.bg}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-sans text-body-sm font-bold text-on-primary ${styles.number}`}>
                    {stageIndex + 1}
                  </span>
                  <div>
                    <p className={`font-sans text-body-sm font-semibold ${styles.badge}`}>{stage.level}</p>
                    <p className="font-sans text-caption text-muted dark:text-on-dark-soft">{stage.description}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {stage.books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start justify-between gap-4 rounded-card border border-hairline bg-surface-card px-4 py-3 dark:border-dark-hairline dark:bg-dark-surface-card"
                    >
                      <div className="flex items-start gap-3">
                        <BookOpenIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div>
                          <p className="font-sans text-body-sm font-medium text-ink dark:text-on-dark">{book.title}</p>
                          {book.author && (
                            <p className="font-sans text-caption text-muted dark:text-on-dark-soft">by {book.author}</p>
                          )}
                          <p className="mt-0.5 font-sans text-caption text-muted-soft dark:text-on-dark-soft">{book.reason}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-pill px-2 py-0.5 font-sans text-[10px] font-semibold ${
                          book.availableCopies > 0
                            ? 'bg-success/15 text-success dark:bg-success/20'
                            : 'bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft'
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
