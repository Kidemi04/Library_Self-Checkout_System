'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';
import { titleFromSlug } from '@/app/ui/dashboard/help/faqSlug';

type FaqReaderProps = {
  topicSlug: string | null;
  onAskAi: () => void;
  onBack: () => void;
};

type AnswerBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

// Group consecutive "• ..." lines into a single bullet list block;
// everything else becomes a paragraph block. This mirrors how the
// content was authored in studentFaqData (paragraph + optional bullets).
function toBlocks(answer: string[]): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      blocks.push({ kind: 'ul', items: bulletBuffer });
      bulletBuffer = [];
    }
  };

  for (const line of answer) {
    const trimmed = line.trim();
    if (trimmed.startsWith('• ')) {
      bulletBuffer.push(trimmed.slice(2).trim());
    } else {
      flushBullets();
      blocks.push({ kind: 'p', text: line });
    }
  }
  flushBullets();
  return blocks;
}

export default function FaqReader({ topicSlug, onAskAi, onBack }: FaqReaderProps) {
  const section = topicSlug
    ? studentFaqSections.find((s) => s.title === titleFromSlug(topicSlug))
    : null;

  if (!section) {
    return (
      <div className="rounded-card border border-hairline bg-surface-card p-8 text-center dark:border-dark-hairline dark:bg-dark-surface-card">
        <p className="font-display text-display-sm tracking-tight text-ink dark:text-on-dark">
          Pick a topic
        </p>
        <p className="mt-2 font-sans text-body-md text-muted dark:text-on-dark-soft">
          Choose a question from the list to see its answer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 font-sans text-button text-primary transition hover:text-primary-active dark:text-dark-primary"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to chat
      </button>

      <article className="rounded-card border border-hairline bg-surface-card p-8 dark:border-dark-hairline dark:bg-dark-surface-card">
        <h2 className="font-display text-display-md tracking-tight text-ink dark:text-on-dark">
          {section.title}
        </h2>
        <p className="mt-3 font-sans text-body-md text-muted dark:text-on-dark-soft">
          {section.description}
        </p>

        <div className="mt-7 space-y-7">
          {section.items.map((item, idx) => {
            const blocks = toBlocks(item.answer);
            return (
              <div
                key={item.question}
                className={
                  idx > 0
                    ? 'border-t border-hairline-soft pt-7 dark:border-dark-hairline'
                    : ''
                }
              >
                <h3 className="font-sans text-title-sm font-semibold text-ink dark:text-on-dark">
                  {item.question}
                </h3>

                <div className="mt-3 space-y-3 font-sans text-body-md text-body dark:text-on-dark-soft">
                  {blocks.map((block, bIdx) =>
                    block.kind === 'p' ? (
                      <p key={bIdx}>{block.text}</p>
                    ) : (
                      <ul key={bIdx} className="list-disc space-y-1.5 pl-6">
                        {block.items.map((li, liIdx) => (
                          <li key={liIdx}>{li}</li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>

                {item.tags && item.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-pill border border-hairline bg-canvas px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted dark:border-dark-hairline dark:bg-dark-surface-strong dark:text-on-dark-soft"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.contactLink ? (
                  <div className="mt-4">
                    {item.contactLink.href.startsWith('/') ? (
                      <Link
                        href={item.contactLink.href}
                        className="font-sans text-button text-primary transition hover:text-primary-active dark:text-dark-primary"
                      >
                        {item.contactLink.label} →
                      </Link>
                    ) : (
                      <a
                        href={item.contactLink.href}
                        className="font-sans text-button text-primary transition hover:text-primary-active dark:text-dark-primary"
                      >
                        {item.contactLink.label} →
                      </a>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </article>

      <div className="rounded-card bg-primary p-8 text-on-primary dark:bg-dark-primary">
        <p className="font-display text-display-sm tracking-tight">Got more questions?</p>
        <p className="mt-2 font-sans text-body-md opacity-90">
          Ask the assistant — it can answer follow-ups and look up specific books.
        </p>
        <button
          type="button"
          onClick={onAskAi}
          className="mt-5 inline-flex h-10 items-center rounded-btn bg-canvas px-5 font-sans text-button text-ink transition hover:bg-surface-cream-strong"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
}
