'use client';

import { type ReactNode, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import StudentChat from '@/app/ui/dashboard/studentChat';

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
};

type ExternalArticle = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  faviconUrl: string | null;
};

type ExternalVideo = {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  url: string;
};

type ExternalResourcesResponse = {
  ok: boolean;
  topic?: string;
  articles?: ExternalArticle[];
  videos?: ExternalVideo[];
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
  const [topic, setTopic] = useState<string | null>(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [articles, setArticles] = useState<ExternalArticle[] | null>(null);
  const [videos, setVideos] = useState<ExternalVideo[] | null>(null);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const requestRef = useRef(0);

  const handleInterestDetected = useCallback((nextTopic: string | null) => {
    if (!nextTopic) {
      requestRef.current += 1;
      setLearningPath(null);
      setTopic(null);
      setPathLoading(false);
      setArticles(null);
      setVideos(null);
      setResourcesLoading(false);
      return;
    }

    const requestId = ++requestRef.current;
    setTopic(nextTopic);
    setLearningPath(null);
    setPathLoading(true);
    setArticles(null);
    setVideos(null);
    setResourcesLoading(true);

    fetch('/api/learning-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: nextTopic }),
    })
      .then((r) => r.json() as Promise<LearningPathResponse>)
      .then((lp) => {
        if (requestId !== requestRef.current) return;
        setLearningPath(lp?.ok && lp.stages?.length ? lp.stages : null);
        setPathLoading(false);
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        setLearningPath(null);
        setPathLoading(false);
      });

    fetch('/api/external-resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: nextTopic }),
    })
      .then((r) => r.json() as Promise<ExternalResourcesResponse>)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setArticles(data?.articles ?? []);
        setVideos(data?.videos ?? []);
        setResourcesLoading(false);
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        setArticles([]);
        setVideos([]);
        setResourcesLoading(false);
      });
  }, []);

  const handleChatReset = useCallback(() => {
    requestRef.current += 1;
    setLearningPath(null);
    setTopic(null);
    setPathLoading(false);
    setArticles(null);
    setVideos(null);
    setResourcesLoading(false);
  }, []);

  const chat = (
    <StudentChat
      studentName={studentName}
      needsOnboarding={needsOnboarding}
      userId={userId}
      onInterestDetected={handleInterestDetected}
      onChatReset={handleChatReset}
    />
  );

  return (
    <div className="space-y-8">
      {sidebar ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {chat}
          {sidebar}
        </div>
      ) : (
        chat
      )}

      {/* Learning path section */}
      {topic ? (
        <section className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-swin-ivory/70">Curated reading order</p>
              <h2 className="mt-2 text-2xl font-semibold">
                Learning path for <span className="text-red-300">{topic}</span>
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
                Books from our catalog arranged from beginner to advanced.
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-red-400/80 shrink-0">
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          {pathLoading && !learningPath ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-swin-ivory/70">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-300" />
                Building a beginner-to-advanced path…
              </span>
            </div>
          ) : null}

          {learningPath?.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {learningPath.map((stage, stageIdx) => {
                const styles = STAGE_STYLES[stage.level];
                return (
                  <div key={stage.level} className={clsx('rounded-2xl border p-4', styles.bg)}>
                    <div className="flex items-start gap-3">
                      <span className={clsx('inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white', styles.number)}>
                        {stageIdx + 1}
                      </span>
                      <div>
                        <p className={clsx('text-sm font-semibold', styles.badge)}>{stage.level}</p>
                        <p className="text-xs text-slate-700 dark:text-slate-400">{stage.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {stage.books.map((book) => {
                        const borrowUrl = `/dashboard/book/checkout?bookId=${encodeURIComponent(book.id)}`;
                        const searchUrl = `/dashboard/book/items?q=${encodeURIComponent(book.title)}`;
                        return (
                          <div key={book.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link href={searchUrl} className="block text-sm font-medium text-slate-900 hover:text-red-600 dark:text-slate-100 dark:hover:text-red-400 line-clamp-2">
                                  {book.title}
                                </Link>
                                {book.author ? (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">by {book.author}</p>
                                ) : null}
                                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-500">{book.reason}</p>
                              </div>
                              <span className={clsx(
                                'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                book.availableCopies > 0
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                              )}>
                                {book.availableCopies > 0 ? `${book.availableCopies}/${book.totalCopies} available` : 'On loan'}
                              </span>
                            </div>
                            {book.availableCopies > 0 ? (
                              <div className="mt-2 flex justify-end">
                                <Link
                                  href={borrowUrl}
                                  className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition"
                                >
                                  Borrow
                                </Link>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {!pathLoading && !learningPath?.length ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-swin-ivory/70">
              No learning path could be built for this topic right now.
            </div>
          ) : null}
        </section>
      ) : null}

      {/* External web resources section */}
      {topic ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              Around the web
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Web articles &amp; videos for <span className="text-red-600 dark:text-red-400">{topic}</span>
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Free sources: Wikipedia, DEV.to, Reddit, Hacker News, and YouTube.
            </p>
          </div>

          {resourcesLoading ? (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                Searching the web for {topic}…
              </span>
            </div>
          ) : null}

          {!resourcesLoading && (articles?.length || videos?.length) ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Articles
                </h3>
                {articles?.length ? (
                  <div className="mt-3 space-y-3">
                    {articles.map((article) => (
                      <a
                        key={article.url}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-red-400 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-red-500"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                          {article.title}
                        </p>
                        {article.snippet ? (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{article.snippet}</p>
                        ) : null}
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {article.faviconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={article.faviconUrl} alt="" className="h-3.5 w-3.5 rounded-sm" loading="lazy" />
                          ) : null}
                          <span className="truncate">{article.source}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">No articles found right now.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  YouTube videos
                </h3>
                {videos?.length ? (
                  <div className="mt-3 space-y-3">
                    {videos.map((video) => (
                      <a
                        key={video.videoId}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-red-400 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-red-500"
                      >
                        {video.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={video.thumbnailUrl} alt={video.title} className="h-16 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />
                        ) : (
                          <div className="h-16 w-24 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{video.title}</p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">{video.channel}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                    No videos found. Add <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">YOUTUBE_API_KEY</code> to <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.local</code> to enable.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
