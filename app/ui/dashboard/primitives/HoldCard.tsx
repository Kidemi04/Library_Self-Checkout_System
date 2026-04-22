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
    <div
      className="relative overflow-hidden rounded-xl border border-swin-red bg-white p-3.5 dark:bg-swin-dark-surface"
      style={{ borderLeft: '3px solid #C82333', boxShadow: '0 0 0 3px rgba(200,35,51,0.08)' }}
    >
      <div className="flex items-stretch gap-3.5">
        <BookCover gradient={gradient} w={48} h={68} />
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-swin-red"
              />
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-swin-red">
                Ready for pickup
              </span>
            </div>
            <p className="truncate font-display text-[19px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
              {hold.title}
            </p>
            {hold.author && (
              <p className="font-mono text-[11px] text-swin-charcoal/50 dark:text-slate-500">
                Sarawak Campus — Level 2 Pickup Shelf
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p
              className="font-mono text-[12px]"
              style={{ color: urgent ? '#C82333' : undefined }}
            >
              Pickup by{' '}
              <span className="font-bold text-swin-charcoal dark:text-white">
                {formatDate(hold.expiresAt)}
              </span>
              <span className="text-swin-charcoal/40 dark:text-slate-500"> · {days}d left</span>
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
    <div className="flex items-center gap-3 rounded-xl border border-swin-charcoal/10 bg-white p-3 dark:border-white/10 dark:bg-swin-dark-surface">
      <BookCover gradient={gradient} w={40} h={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[17px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
          {hold.title}
        </p>
        {hold.author && (
          <p className="mt-0.5 truncate font-display text-[12px] italic text-swin-charcoal/50 dark:text-slate-500">
            {hold.author}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[12px] text-swin-charcoal/50 dark:text-slate-500">
          <span className="font-semibold text-swin-gold">In queue</span>
          {hold.placedAt && (
            <>
              <span>·</span>
              <span>since {formatDate(hold.placedAt)}</span>
            </>
          )}
        </div>
        {/* Progress bar placeholder */}
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-swin-charcoal/10 dark:bg-white/10">
          <div className="h-full w-1/3 rounded-full bg-swin-gold" />
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
