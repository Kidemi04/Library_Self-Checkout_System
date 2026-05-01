'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import BookCover from '@/app/ui/dashboard/primitives/BookCover';
import Chip from '@/app/ui/dashboard/primitives/Chip';

type RecBook = {
  id: string;
  title: string;
  author: string;
  cover: string;
  reason: string;
  tags: string[];
};

const REC_BOOKS: RecBook[] = [
  {
    id: 'R1',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    cover: 'linear-gradient(135deg, #A88D5A 0%, #6B5A38 100%)',
    reason: 'Based on your history',
    tags: ['History', 'Bestseller'],
  },
  {
    id: 'R2',
    title: 'The Pragmatic Programmer',
    author: 'Hunt & Thomas',
    cover: 'linear-gradient(135deg, #1A3A4F 0%, #0D1F2C 100%)',
    reason: 'Popular in ICT',
    tags: ['Computing', 'Classic'],
  },
  {
    id: 'R3',
    title: 'Deep Work',
    author: 'Cal Newport',
    cover: 'linear-gradient(135deg, #3A4A2F 0%, #1F2818 100%)',
    reason: 'Trending this week',
    tags: ['Self-help'],
  },
  {
    id: 'R4',
    title: 'Zero to One',
    author: 'Peter Thiel',
    cover: 'linear-gradient(135deg, #1F2128 0%, #3A3D4A 100%)',
    reason: 'ICT students also read',
    tags: ['Business', 'Tech'],
  },
  {
    id: 'R5',
    title: 'The Phoenix Project',
    author: 'Gene Kim et al.',
    cover: 'linear-gradient(135deg, #4A2A1A 0%, #8B4A2A 100%)',
    reason: 'Related to your subjects',
    tags: ['Computing', 'DevOps'],
  },
  {
    id: 'R6',
    title: 'Mindset',
    author: 'Carol Dweck',
    cover: 'linear-gradient(135deg, #2A1A4A 0%, #6B4A9A 100%)',
    reason: 'Recommended by staff',
    tags: ['Psychology'],
  },
];

export default function BookRecommendations({ studentName }: { studentName?: string | null }) {
  const [chatInput, setChatInput] = useState('');
  const [aiReplied, setAiReplied] = useState(false);

  function askAI() {
    if (!chatInput.trim()) return;
    window.setTimeout(() => setAiReplied(true), 1000);
  }

  const eyebrowName = studentName ? studentName.split(' ')[0] : 'you';

  return (
    <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Left column: curated grid */}
      <div>
        <div className="mb-5 flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-primary dark:text-dark-primary" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted dark:text-on-dark-soft">
            Curated for {eyebrowName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[18px] sm:grid-cols-3">
          {REC_BOOKS.map((book) => (
            <button
              key={book.id}
              type="button"
              className="group flex cursor-pointer flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
            >
              <BookCover
                gradient={book.cover}
                title={book.title}
                author={book.author}
                w={168}
                h={240}
                radius={6}
              />
              <div className="mt-2.5 flex flex-col gap-1.5">
                <h3 className="font-display text-[15px] font-semibold leading-[1.15] tracking-[-0.2px] text-ink dark:text-on-dark">
                  {book.title}
                </h3>
                <p className="font-display text-[11px] italic text-muted dark:text-on-dark-soft">
                  {book.author}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {book.tags.map((tag) => (
                    <Chip key={tag} mono>
                      {tag}
                    </Chip>
                  ))}
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-soft dark:text-on-dark-soft">
                  {book.reason}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right column: AI prompt card */}
      <aside className="self-start">
        <div className="rounded-hero border border-hairline bg-surface-card px-5 py-[22px] dark:border-dark-hairline dark:bg-dark-surface-card">
          <div className="mb-2.5 flex items-center gap-2">
            <SparklesIcon className="h-3.5 w-3.5 text-primary dark:text-dark-primary" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted dark:text-on-dark-soft">
              AI Recommendations
            </span>
          </div>

          <h2 className="mb-1.5 font-display text-[20px] font-semibold tracking-[-0.3px] text-ink dark:text-on-dark">
            Tell me what you want
          </h2>
          <p className="mb-3.5 font-sans text-[12px] leading-[1.5] text-body dark:text-on-dark/85">
            Describe what you're looking for and I'll find matching books in the catalogue.
          </p>

          <textarea
            rows={3}
            value={chatInput}
            onChange={(e) => {
              setChatInput(e.target.value);
              if (aiReplied) setAiReplied(false);
            }}
            placeholder="e.g. I want something about startup culture…"
            className="mb-2.5 box-border w-full resize-none rounded-btn border border-hairline bg-canvas px-3 py-2.5 font-sans text-[12px] text-ink outline-none transition placeholder:text-muted-soft focus:border-primary/40 focus:ring-2 focus:ring-primary/15 dark:border-dark-hairline dark:bg-dark-canvas dark:text-on-dark dark:placeholder:text-on-dark-soft"
          />

          <button
            type="button"
            onClick={askAI}
            disabled={!chatInput.trim()}
            className="w-full rounded-btn bg-primary px-0 py-[11px] font-sans text-[12px] font-bold text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted dark:bg-dark-primary dark:hover:bg-primary-active"
          >
            Find recommendations
          </button>

          {aiReplied ? (
            <div
              className="mt-4 rounded-card border border-hairline bg-surface-cream-strong/60 p-3.5 font-sans text-[12px] leading-[1.6] text-body dark:border-dark-hairline dark:bg-dark-surface-strong/60 dark:text-on-dark/90"
              style={{ animation: 'popIn .3s ease' }}
            >
              Based on your interest, I'd recommend{' '}
              <em className="font-display font-semibold italic text-ink dark:text-on-dark">
                Zero to One
              </em>{' '}
              by Peter Thiel and{' '}
              <em className="font-display font-semibold italic text-ink dark:text-on-dark">
                The Lean Startup
              </em>{' '}
              by Eric Ries. Both are available at Sarawak Campus.
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
