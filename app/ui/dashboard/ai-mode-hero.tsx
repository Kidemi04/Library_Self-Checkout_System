'use client';

import React, { useRef, useState } from 'react';
import clsx from 'clsx';

export default function AiModeHero({ defaultQuery }: { defaultQuery: string }) {
  const [open, setOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file.name);
  };

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedImage(file.name);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-100 p-5 text-slate-900 shadow-2xl shadow-slate-200 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 dark:shadow-black/40 sm:rounded-3xl sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/40">
            AI Mode
          </span>
          <span className="text-slate-600 dark:text-slate-500">Ask for book ideas, topics, or authors.</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition',
            open
              ? 'border-emerald-400/70 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-300/60 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20'
              : 'border-slate-300 bg-white/70 text-slate-700 hover:border-emerald-300/60 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:text-emerald-200',
          )}
          aria-pressed={open}
        >
          <span className="text-base">{open ? '▾' : '▸'}</span>
          <span>{open ? 'Close AI Mode' : 'Open AI Mode'}</span>
        </button>
      </div>

      {open ? (
        <>
          <div className="mt-4 space-y-2 text-center sm:space-y-3">
            <h1 className="text-2xl font-bold sm:text-4xl">Meet AI Mode</h1>
            <p className="text-sm text-slate-600 sm:text-lg dark:text-slate-300/90">
              Ask detailed questions for better recommendations.
            </p>
          </div>

          <form action="/dashboard/book?section=items" method="get" className="mx-auto mt-5 w-full max-w-4xl sm:mt-6">
            <label htmlFor="ai-query" className="sr-only">
              Ask anything
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/90 px-3 py-2.5 shadow-inner shadow-slate-200 transition focus-within:border-emerald-400/70 focus-within:shadow-emerald-300/30 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/30 dark:focus-within:shadow-emerald-500/20 sm:gap-3 sm:px-4 sm:py-3">
              <input
                id="ai-query"
                name="q"
                defaultValue={defaultQuery}
                placeholder="Ask anything"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 sm:text-base"
              />
              <div className="flex items-center gap-2 text-slate-400 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-700 shadow transition hover:border-emerald-300/60 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-emerald-200 sm:h-10 sm:w-10 sm:text-xl"
                  aria-label="Upload file"
                  onClick={() => fileInputRef.current?.click()}
                >
                  +
                </button>
                <button
                  type="button"
                  className="hidden"
                  aria-label="Upload image for AI recognition"
                  onClick={() => imageInputRef.current?.click()}
                />
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                <button
                  type="submit"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/40 transition hover:scale-105 hover:bg-emerald-400 sm:h-10 sm:w-10"
                  aria-label="Search catalogue with AI mode"
                >
                  Go
                </button>
              </div>
            </div>
          </form>

          {(selectedFile || selectedImage) && (
            <div className="mx-auto mt-3 flex max-w-4xl flex-wrap items-center gap-2 text-xs text-slate-500 sm:gap-3 dark:text-slate-300">
              {selectedFile ? (
                <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                  File: {selectedFile}
                </span>
              ) : null}
              {selectedImage ? (
                <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                  Image: {selectedImage}
                </span>
              ) : null}
            </div>
          )}

          <div className="mx-auto mt-4 flex max-w-4xl flex-col gap-2 text-left text-sm text-slate-700 sm:mt-6 sm:gap-3 dark:text-slate-200/90">
            {[
              'Find beginner-friendly AI and data books',
              'Suggest classics about leadership and design',
              'Show recent titles on sustainability and climate',
            ].map((prompt) => (
              <a
                key={prompt}
                href={`/dashboard/book?section=items?q=${encodeURIComponent(prompt)}`}
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm transition hover:border-emerald-400/60 hover:bg-emerald-50 sm:px-4 sm:py-3 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-emerald-500/5"
              >
                <span className="text-emerald-500 dark:text-emerald-300">✦</span>
                <span className="text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
                  {prompt}
                </span>
              </a>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-300 bg-white/80 px-3 py-2.5 text-sm text-slate-700 sm:px-4 sm:py-3 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-lg text-slate-500 dark:text-slate-400">🔍</span>
            <span className="text-slate-700 dark:text-slate-300">AI Mode is ready. Open it to ask for recommendations.</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-emerald-400/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:bg-emerald-500/20"
          >
            Open
          </button>
        </div>
      )}
    </section>
  );
}
