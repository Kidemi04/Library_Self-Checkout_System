import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import {
  cancelHoldForPatron,
  fetchActiveHoldsForPatron,
  type PatronHold,
} from '@/app/lib/supabase/queries';
import AdminShell from '@/app/ui/dashboard/adminShell';
import HoldCard from '@/app/ui/dashboard/primitives/HoldCard';
import KpiCard from '@/app/ui/dashboard/primitives/KpiCard';
import CancelHoldButton from '@/app/ui/dashboard/cancelHoldButton';

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

  revalidatePath('/dashboard/book/reservation');
}

function sortReadyFirst(holds: PatronHold[]): PatronHold[] {
  return [...holds].sort(
    (a, b) => (a.status === 'ready' ? -1 : 1) - (b.status === 'ready' ? -1 : 1),
  );
}

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
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? '—' : dateFormatter.format(d);
};
const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.valueOf()) ? '—' : dateTimeFormatter.format(d);
};
const getReadyMessage = (hold: PatronHold): string => {
  if (hold.status === 'ready') {
    return hold.expiresAt
      ? `Collect by ${formatDateTime(hold.expiresAt)} to keep your spot.`
      : 'Collect the book from the service desk.';
  }
  return 'We will notify you once the copy is ready to be picked up.';
};

export default async function MyReservationsPage() {
  const { user } = await getDashboardSession();

  if (!user) redirect('/login');
  if (user.role !== 'user') redirect('/dashboard');

  const holds = await fetchActiveHoldsForPatron(user.id);
  const ready = holds.filter((h) => h.status === 'ready');
  const queued = holds.filter((h) => h.status === 'queued');
  const sorted = sortReadyFirst(holds);

  return (
    <>
      <title>My Reservations | Dashboard</title>

      <AdminShell
        titleSubtitle="Reservations"
        title="Your Reservations"
        description="Track your position in the queue. We will notify you when your hold is ready for pickup."
      >
        {/* Summary strip */}
        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard label="Total holds" value={holds.length} />
          <KpiCard
            label="Ready for pickup"
            value={ready.length}
            danger={ready.length > 0}
            delta={ready.length > 0 ? `${ready.length} ready` : undefined}
            footer="collect at desk"
            className={ready.length > 0 ? 'border-swin-red/40 dark:border-swin-red/40' : undefined}
          />
          <KpiCard label="In queue" value={queued.length} />
        </div>

        {holds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-swin-charcoal/15 bg-white p-10 text-center dark:border-white/10 dark:bg-swin-dark-surface">
            <p className="font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              No active reservations
            </p>
            <p className="mt-2 text-[13px] text-swin-charcoal/55 dark:text-white/55">
              You have not reserved any books yet. Browse the catalogue to place a hold.
            </p>
            <Link
              href="/dashboard/book/items"
              className="mt-5 inline-flex rounded-full bg-swin-red px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-swin-red/90"
            >
              Browse catalogue
            </Link>
          </div>
        ) : (
          <>
            <h2 className="mb-3 font-display text-[22px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
              Active reservations
            </h2>
            <ul className="space-y-4">
              {sorted.map((hold) => {
                const canCancel = hold.status === 'queued' || hold.status === 'ready';
                return (
                  <li
                    key={hold.id}
                    className="overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface"
                  >
                    <div className="p-1">
                      <HoldCard hold={hold} />
                    </div>

                    {/* Details row */}
                    <dl className="grid grid-cols-1 gap-3 border-t border-swin-charcoal/8 px-4 py-3 text-[12px] dark:border-white/8 sm:grid-cols-3">
                      <div>
                        <dt className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                          Placed on
                        </dt>
                        <dd className="mt-0.5 font-medium text-swin-charcoal dark:text-white">
                          {formatDate(hold.placedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                          Ready since
                        </dt>
                        <dd className="mt-0.5 font-medium text-swin-charcoal dark:text-white">
                          {hold.readyAt ? formatDateTime(hold.readyAt) : 'Not yet ready'}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                          Expires
                        </dt>
                        <dd className="mt-0.5 font-medium text-swin-charcoal dark:text-white">
                          {hold.expiresAt ? formatDateTime(hold.expiresAt) : '—'}
                        </dd>
                      </div>
                      {hold.isbn && (
                        <div className="sm:col-span-3">
                          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                            ISBN
                          </dt>
                          <dd className="mt-0.5 font-mono text-[12px] text-swin-charcoal/80 dark:text-white/80">
                            {hold.isbn}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {/* Footer with action + message */}
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 border-t border-swin-charcoal/8 px-4 py-3 text-[12px] dark:border-white/8 ${
                        hold.status === 'ready'
                          ? 'text-swin-red'
                          : 'text-swin-charcoal/65 dark:text-white/65'
                      }`}
                    >
                      <p>{getReadyMessage(hold)}</p>
                      {canCancel && (
                        <CancelHoldButton
                          holdId={hold.id}
                          bookTitle={hold.title}
                          cancelAction={cancelReservation}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </AdminShell>
    </>
  );
}
