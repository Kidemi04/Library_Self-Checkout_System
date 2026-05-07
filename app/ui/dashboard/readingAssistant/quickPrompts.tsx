'use client';

type QuickPromptsProps = {
  onPick: (prompt: string) => void;
};

const PROMPTS: string[] = [
  'How do I renew a loan?',
  'What happens if a book is overdue?',
  'Find me a fantasy novel',
  'Recommend something light for the weekend',
  'How do I place a hold?',
  'Computer science textbooks I can borrow now',
];

export default function QuickPrompts({ onPick }: QuickPromptsProps) {
  return (
    <div>
      <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
        Suggestions to start
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-btn border border-hairline bg-canvas px-4 py-3 text-left font-sans text-body-sm text-ink transition hover:border-primary/40 hover:bg-primary/5 dark:border-dark-hairline dark:bg-dark-canvas dark:text-on-dark dark:hover:border-dark-primary/40 dark:hover:bg-dark-primary/10"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
