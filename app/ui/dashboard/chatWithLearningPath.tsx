'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import StudentChat from '@/app/ui/dashboard/studentChat';
import PlaceHoldButton from '@/app/ui/dashboard/placeHoldButton';

type LearningStageBook = {
  id: string;
  title: string;
  author: string | null;
  availableCopies: number;
  totalCopies: number;
  reason: string;
};

type LearningStage = {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  books: LearningStageBook[];
};

type LearningPathResponse = {
  ok: boolean;
  topic?: string;
  stages?: LearningStage[];
  error?: string;
};

const STAGE_STYLES: Record<LearningStage['level'], { bg: string; badge: string; number: string }> = {
  Beginner: {
    bg: 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/10',
    badge: 'text-emerald-700 dark:text-emerald-300',
    number: 'bg-emerald-600',
  },
  Intermediate: {
    bg: 'border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/10',
    badge: 'text-amber-700 dark:text-amber-300',
    number: 'bg-amber-600',
  },
  Advanced: {
    bg: 'border-rose-200 bg-rose-50/60 dark:border-rose-800/40 dark:bg-rose-900/10',
    badge: 'text-rose-700 dark:text-rose-300',
    number: 'bg-rose-600',
  },
};

export default function ChatWithLearningPath({
  studentName,
  needsOnboarding,
  userId,
  sidebar,
}: {
  studentName?: string | null;
  needsOnboarding?: boolean;
  userId?: string;
  sidebar?: ReactNode;
}) {
  const [learningPath, setLearningPath] = useState<LearningStage[] | null>(null);
  const [learningPathTopic, setLearningPathTopic] = useState<string | null>(null);
  const [learningPathLoading, setLearningPathLoading] = useState(false);
  const requestRef = useRef(0);

  const handleInterestDetected = useCallback((topic: string | null) => {
    if (!topic) {
      requestRef.current += 1;
      setLearningPath(null);
      setLearningPathTopic(null);
      setLearningPathLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setLearningPathTopic(topic);
    setLearningPath(null);
    setLearningPathLoading(true);

    fetch('/api/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
      .then((r) => r.json() as Promise<LearningPathResponse>)
      .then((lp) => {
        if (requestId !== requestRef.current) return;
        setLearningPath(lp?.ok && lp.stages?.length ? lp.stages : null);
        setLearningPathLoading(false);
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        setLearningPath(null);
        setLearningPathLoading(false);
      });
  }, []);

  const handleChatReset = useCallback(() => {
    requestRef.current += 1;
    setLearningPath(null);
    setLearningPathTopic(null);
    setLearningPathLoading(false);
  }, []);

  const showStages = Boolean(learningPath?.length);
  const showLoading = learningPathLoading && !showStages;
  const showEmpty = !learningPathTopic && !showLoading && !showStages;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <StudentChat
          studentName={studentName}
          needsOnboarding={needsOnboarding}
          userId={userId}
          onInterestDetected={handleInterestDetected}
          onChatReset={handleChatReset}
        />
        {sidebar}
      </div>

      <section className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-swin-ivory/70">Curated reading order</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {learningPathTopic ? (
                <>
                  Learning path for{' '}
                  <span className="text-red-300">{learningPathTopic}</span>
                </>
              ) : (
                'Learning path'
              )}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
              When you ask the assistant about a topic, we automatically arrange relevant books from our catalog into a beginner-to-advanced reading order.
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-red-400/80 shrink-0">
            <path d="M12 2 2 7l10 5 10-5-10-5Z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        {showEmpty ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-swin-ivory/70">
            Try asking the assistant something like <span className="text-white">&quot;recommend me some artificial intelligence books&quot;</span> or use one of the quick prompts above. Your learning path will appear here.
          </div>
        ) : null}

        {showLoading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-swin-ivory/70">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-ping rounded-full bg-red-300" />
              Building a beginner-to-advanced path for {learningPathTopic}…
            </span>
          </div>
        ) : null}

        {showStages ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {learningPath!.map((stage, stageIdx) => {
              const styles = STAGE_STYLES[stage.level];
              return (
                <div key={stage.level} className={clsx('rounded-2xl border p-4', styles.bg)}>
                  <div className="flex items-start gap-3">
                    <span
                      className={clsx(
                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
                        styles.number,
                      )}
                    >
                      {stageIdx + 1}
                    </span>
                    <div>
                      <p className={clsx('text-sm font-semibold', styles.badge)}>{stage.level}</p>
                      <p className="text-xs text-slate-700 dark:text-slate-400">{stage.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {stage.books.map((book) => {
                      const bookSearch = `/dashboard/book/items?q=${encodeURIComponent(book.title)}`;
                      const borrowUrl = `/dashboard/book/checkout?bookId=${encodeURIComponent(book.id)}`;
                      return (
                        <div
                          key={book.id}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={bookSearch}
                                className="block text-sm font-medium text-slate-900 hover:text-red-600 dark:text-slate-100 dark:hover:text-red-400 line-clamp-2"
                              >
                                {book.title}
                              </Link>
                              {book.author ? (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">by {book.author}</p>
                              ) : null}
                              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500">{book.reason}</p>
                            </div>
                            <span
                              className={clsx(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                book.availableCopies > 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                              )}
                            >
                              {book.availableCopies > 0
                                ? `${book.availableCopies}/${book.totalCopies} available`
                                : 'On loan'}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-end">
                            {book.availableCopies > 0 ? (
                              <Link
                                href={borrowUrl}
                                className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition"
                              >
                                Borrow
                              </Link>
                            ) : (
                              <PlaceHoldButton
                                bookId={book.id}
                                patronId={userId}
                                bookTitle={book.title}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
