import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  cancelHoldForPatron,
  fetchActiveHoldsForPatron,
  type PatronHold,
} from '@/app/lib/supabase/queries';

const dateFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-MY', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '—';
  return dateFormatter.format(date);
};

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '—';
  return dateTimeFormatter.format(date);
};

const statusMeta: Record<
  PatronHold['status'],
  { label: string; badge: string; accent: string }
> = {
  READY: {
    label: 'Ready for pickup',
    badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    accent: 'text-emerald-700',
  },
  QUEUED: {
    label: 'Waiting in queue',
    badge: 'bg-sky-100 text-sky-800 border border-sky-200',
    accent: 'text-sky-700',
  },
  FULFILLED: {
    label: 'Fulfilled',
    badge: 'bg-slate-100 text-slate-800 border border-slate-200',
    accent: 'text-slate-600',
  },
  EXPIRED: {
    label: 'Expired',
    badge: 'bg-amber-100 text-amber-800 border border-amber-200',
    accent: 'text-amber-700',
  },
  CANCELED: {
    label: 'Cancelled',
    badge: 'bg-slate-100 text-slate-700 border border-slate-200',
    accent: 'text-slate-600',
  },
};

async function cancelReservation(formData: FormData) {
  'use server';

  const holdId = formData.get('holdId');
  if (typeof holdId !== 'string') return;

  const { user } = await getDashboardSession();
  if (!user) return;

  try {
    await cancelHoldForPatron(holdId, user.id);
  } catch (error) {
    console.error('Failed to cancel hold', error);
  }

  revalidatePath('/dashboard/reservations');
}

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
    <p className="text-base font-semibold text-slate-800">No active reservations</p>
    <p className="mt-2 text-sm text-slate-500">
      You haven’t reserved any books yet. Browse the catalogue to place a hold on a book that
      is currently unavailable.
    </p>
    <Link
      href="/dashboard/book-items"
      className="mt-6 inline-flex items-center justify-center rounded-full bg-swin-charcoal px-4 py-2 text-sm font-semibold text-white shadow hover:bg-swin-charcoal/90"
    >
      Browse catalogue
    </Link>
  </div>
);

const ReservationCard = ({ hold }: { hold: PatronHold }) => {
  const meta = statusMeta[hold.status] ?? statusMeta.QUEUED;
  const readyMessage =
    hold.status === 'READY'
      ? hold.expiresAt
        ? `Collect by ${formatDateTime(hold.expiresAt)} to keep your spot.`
        : 'Collect the book from the service desk.'
      : 'We will notify you once the copy is ready to be picked up.';

  const cancellationAllowed = hold.status === 'QUEUED' || hold.status === 'READY';

  return (
    <li className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/50">
      <div className="flex flex-wrap gap-4">
        <div className="h-20 w-16 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
          {hold.coverImage ? (
            <img
              src={hold.coverImage}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No cover
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">{hold.title}</p>
            <p className="text-sm text-slate-500">{hold.author ?? 'Unknown author'}</p>
            {hold.isbn ? (
              <p className="text-xs text-slate-400">ISBN {hold.isbn}</p>
            ) : null}
          </div>
          <span className={`inline-flex h-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
            {meta.label}
          </span>
        </div>
      </div>

      <dl className="grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Placed on</dt>
          <dd className="font-medium text-slate-800">{formatDate(hold.placedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Ready since</dt>
          <dd className="font-medium text-slate-800">
            {hold.readyAt ? formatDateTime(hold.readyAt) : 'Not yet ready'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Expires</dt>
          <dd className="font-medium text-slate-800">
            {hold.expiresAt ? formatDateTime(hold.expiresAt) : '—'}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <p className={`text-sm ${meta.accent}`}>{readyMessage}</p>
        {cancellationAllowed ? (
          <form action={cancelReservation}>
            <input type="hidden" name="holdId" value={hold.id} />
            <button
              type="submit"
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
            >
              Cancel hold
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );
};

export default async function MyReservationsPage() {
  const { user } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'user') {
    redirect('/dashboard');
  }

  const holds = await fetchActiveHoldsForPatron(user.id);

  return (
    <main className="space-y-8">
      <title>My Reservations | Dashboard</title>

      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Reservations</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">My reserved books</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track items that are waiting for you or currently in the reservation queue. We’ll
          notify you by email when it’s your turn to collect them.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Active reservations</h2>
          <p className="text-sm text-slate-500">
            {holds.length} reservation{holds.length === 1 ? '' : 's'}
          </p>
        </div>

        {holds.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-6">
            {holds.map((hold) => (
              <ReservationCard key={hold.id} hold={hold} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
