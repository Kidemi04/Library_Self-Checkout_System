'use client';

import clsx from 'clsx';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';
import { slugFromTitle } from '@/app/ui/dashboard/help/faqSlug';

type Mode = 'chat' | 'faq' | 'find-book';

type HelpNavigatorProps = {
  mode: Mode;
  topicSlug: string | null;
  onSelectFaq: (slug: string) => void;
  onSelectFindBook: () => void;
};

export default function HelpNavigator({
  mode,
  topicSlug,
  onSelectFaq,
  onSelectFindBook,
}: HelpNavigatorProps) {
  return (
    <nav
      aria-label="Help topics"
      className="rounded-card border border-hairline bg-surface-card p-4 dark:border-dark-hairline dark:bg-dark-surface-card"
    >
      <p className="px-3 pb-2 font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
        Quick Answers
      </p>
      <ul className="space-y-1">
        {studentFaqSections.map((section) => {
          const slug = slugFromTitle(section.title);
          const isActive = mode === 'faq' && topicSlug === slug;
          return (
            <li key={slug}>
              <button
                type="button"
                onClick={() => onSelectFaq(slug)}
                className={clsx(
                  'group relative flex w-full items-center gap-3 rounded-btn border px-3 py-2 text-left transition',
                  isActive
                    ? 'border-hairline bg-surface-cream-strong text-ink dark:border-dark-hairline dark:bg-dark-surface-strong dark:text-on-dark'
                    : 'border-transparent text-body hover:border-hairline hover:bg-canvas dark:text-on-dark-soft dark:hover:border-dark-hairline dark:hover:bg-dark-canvas',
                )}
              >
                {isActive && (
                  <span
                    className="absolute inset-y-1 left-0 w-[3px] rounded-pill bg-primary dark:bg-dark-primary"
                    aria-hidden="true"
                  />
                )}
                <BookOpenIcon className="h-[18px] w-[18px] flex-shrink-0" />
                <span className="font-sans text-nav-link">{section.title}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-hairline-soft pt-3 dark:border-dark-hairline">
        <button
          type="button"
          onClick={onSelectFindBook}
          className={clsx(
            'group relative flex w-full items-center gap-3 rounded-btn border px-3 py-2 text-left transition',
            mode === 'find-book'
              ? 'border-hairline bg-surface-cream-strong text-ink dark:border-dark-hairline dark:bg-dark-surface-strong dark:text-on-dark'
              : 'border-transparent text-body hover:border-hairline hover:bg-canvas dark:text-on-dark-soft dark:hover:border-dark-hairline dark:hover:bg-dark-canvas',
          )}
        >
          {mode === 'find-book' && (
            <span
              className="absolute inset-y-1 left-0 w-[3px] rounded-pill bg-primary dark:bg-dark-primary"
              aria-hidden="true"
            />
          )}
          <SparklesIcon className="h-[18px] w-[18px] flex-shrink-0 text-primary dark:text-dark-primary" />
          <span className="font-sans text-nav-link">Find a book</span>
        </button>
      </div>
    </nav>
  );
}
