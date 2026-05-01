'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';

type SearchDefaults = {
  query?: string;
  difficulty?: string;
};

export default function LinkedInLearningSearchForm({
  defaults,
  providerLabel = 'LinkedIn Learning',
}: {
  defaults: SearchDefaults;
  providerLabel?: string;
}) {
  const query = defaults.query ?? '';
  const difficulty = defaults.difficulty ?? 'ALL';
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (inputRef.current) inputRef.current.value = query;
    if (selectRef.current) selectRef.current.value = difficulty;
  }, [query, difficulty]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? '';
    const diff = selectRef.current?.value ?? 'ALL';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (diff && diff !== 'ALL') params.set('difficulty', diff);
    const qs = params.toString();
    router.push(`/dashboard/learning/linkedin${qs ? `?${qs}` : ''}`);
  };

  const handleReset = () => {
    if (inputRef.current) inputRef.current.value = '';
    if (selectRef.current) selectRef.current.value = 'ALL';
    router.push('/dashboard/learning/linkedin');
  };

  return (
    <form
      className="grid gap-4 rounded-card border border-hairline bg-surface-card p-6 dark:border-dark-hairline dark:bg-dark-surface-card"
      onSubmit={handleSubmit}
    >
      <label className="font-sans text-body-sm font-medium text-ink dark:text-on-dark">
        Search {providerLabel}
        <span className="mt-2 flex items-center gap-3 rounded-btn border border-hairline bg-canvas px-4 py-3 dark:border-dark-hairline dark:bg-dark-surface-soft focus-within:ring-2 focus-within:ring-primary/40 focus-within:ring-offset-2 focus-within:ring-offset-canvas dark:focus-within:ring-offset-dark-canvas">
          <MagnifyingGlassIcon className="h-5 w-5 text-muted-soft dark:text-on-dark-soft" />
          <input
            ref={inputRef}
            type="search"
            defaultValue={query}
            placeholder='Try "algorithms" or "calculus"'
            className="w-full border-none bg-transparent font-sans text-body-md text-ink placeholder:text-muted-soft focus:outline-none dark:text-on-dark dark:placeholder:text-on-dark-soft"
          />
        </span>
      </label>

      <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_auto] md:items-end">
        <label className="font-sans text-body-sm font-medium text-ink dark:text-on-dark">
          Difficulty
          <select
            ref={selectRef}
            defaultValue={difficulty}
            className="mt-2 h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
          >
            <option value="ALL">All levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <div className="flex gap-3">
          <Button type="submit" className="flex-1 justify-center">
            Search
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className="flex h-10 items-center rounded-btn border border-hairline bg-canvas px-5 font-sans text-button text-ink transition hover:border-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary dark:focus-visible:ring-offset-dark-canvas"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
