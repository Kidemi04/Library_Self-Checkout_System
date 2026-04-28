import type { PatronHold } from '@/app/lib/supabase/queries';
import BookCover, { getBookGradient } from './BookCover';

function getDaysUntilExpiry(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const exp = new Date(expiresAt);
  const now = new Date();
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

function HoldCardReady({ hold }: { hold: PatronHold }) {
  const days = getDaysUntilExpiry(hold.expiresAt);
  const urgent = days <= 1;
  const gradient = getBookGradient(hold.bookId);

  return (
    <div className="relative overflow-hidden rounded-card border border-primary/30 border-l-[3px] border-l-primary bg-surface-card p-5 dark:border-dark-primary/30 dark:border-l-dark-primary dark:bg-dark-surface-card">
      <div className="flex items-stretch gap-3.5">
        <BookCover gradient={gradient} w={48} h={68} />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary dark:bg-dark-primary" />
              <span className="font-sans text-caption-uppercase text-primary dark:text-dark-primary">
                Ready for pickup
              </span>
            </div>
            <p className="truncate font-sans text-title-md text-ink dark:text-on-dark">
              {hold.title}
            </p>
            {hold.author && (
              <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
                Sarawak Campus — Level 2 Pickup Shelf
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p
              className={
                urgent
                  ? 'font-sans text-caption text-primary dark:text-dark-primary'
                  : 'font-sans text-caption text-muted dark:text-on-dark-soft'
              }
            >
              Pickup by{' '}
              <span className="font-semibold text-ink dark:text-on-dark">
                {formatDate(hold.expiresAt)}
              </span>
              <span className="text-muted-soft dark:text-on-dark-soft"> · {days}d left</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HoldCardQueued({ hold }: { hold: PatronHold }) {
  const gradient = getBookGradient(hold.bookId);

  return (
    <div className="flex items-center gap-3 rounded-card border border-hairline bg-surface-card p-5 transition-colors hover:border-primary/20 dark:border-dark-hairline dark:bg-dark-surface-card dark:hover:border-dark-primary/30">
      <BookCover gradient={gradient} w={40} h={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-title-md text-ink dark:text-on-dark">
          {hold.title}
        </p>
        {hold.author && (
          <p className="mt-0.5 truncate font-sans text-body-sm text-muted dark:text-on-dark-soft">
            {hold.author}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 font-sans text-caption text-muted dark:text-on-dark-soft">
          <span className="font-semibold text-accent-amber">In queue</span>
          {hold.placedAt && (
            <>
              <span>·</span>
              <span>since {formatDate(hold.placedAt)}</span>
            </>
          )}
        </div>
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-surface-cream-strong dark:bg-dark-surface-strong">
          <div className="h-full w-1/3 rounded-full bg-accent-amber" />
        </div>
      </div>
    </div>
  );
}

type HoldCardProps = {
  hold: PatronHold;
};

export default function HoldCard({ hold }: HoldCardProps) {
  if (hold.status === 'ready') return <HoldCardReady hold={hold} />;
  return <HoldCardQueued hold={hold} />;
}
