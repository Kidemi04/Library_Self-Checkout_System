// app/dashboard/holds/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchHoldsForStaff, updateHoldStatus } from '@/app/lib/supabase/queries';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createUserNotification } from '@/app/lib/supabase/notifications';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import MarkReadyButton from '@/app/ui/dashboard/markReadyButton';

// ---------- server actions ----------

async function markReady(formData: FormData) {
  'use server';

  const holdId = formData.get('holdId') as string | null;
  const patronId = formData.get('patronId') as string | null;
  const bookId = formData.get('bookId') as string | null;
  const bookTitle = formData.get('bookTitle') as string | null;

  if (!holdId || !patronId || !bookId) return;

  // Guard: only the first QUEUED hold for this book (earliest placed_at) may be marked ready.
  const supabase = getSupabaseServerClient();
  const { data: firstInQueue } = await supabase
    .from('Holds')
    .select('id')
    .eq('book_id', bookId)
    .eq('status', 'queued')
    .order('placed_at', { ascending: true })
    .limit(1)
    .single();

  if (!firstInQueue || firstInQueue.id !== holdId) return;

  // Guard: at least one copy must have been returned (status = 'available')
  const { data: availableCopy } = await supabase
    .from('Copies')
    .select('id')
    .eq('book_id', bookId)
    .eq('status', 'available')
    .limit(1);

  if (!availableCopy || availableCopy.length === 0) return;

  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 3);

  // 1) Update hold status + timestamps
  await updateHoldStatus(holdId, {
    status: 'ready',
    ready_at: now.toISOString(),
    expires_at: expires.toISOString(),
  });

  // 2) Send in-app notification to the patron whose hold is first in queue
  await createUserNotification(
    patronId,
    'hold_ready',
    'Your hold is ready for pickup',
    bookTitle
      ? `Your hold for "${bookTitle}" is ready for pickup. Please collect it before ${expires.toLocaleDateString()}.`
      : `One of your holds is ready for pickup. Please collect it before ${expires.toLocaleDateString()}.`,
    {
      holdId,
      bookId,
      bookTitle: bookTitle ?? '',
      expiresAt: expires.toISOString(),
    },
  );

  // 3) Refresh staff holds page
  revalidatePath('/dashboard/book/holds');
}

async function cancelHold(formData: FormData) {
  'use server';

  const holdId = formData.get('holdId') as string | null;
  if (!holdId) return;

  await updateHoldStatus(holdId, {
    status: 'canceled',
    ready_at: null,
    expires_at: null,
    fulfilled_by_copy_id: null,
  });

  revalidatePath('/dashboard/book/holds');
}

// ---------- page ----------

export default async function HoldsManagementPage() {
  const { user } = await getDashboardSession();
  if (!user) {
    redirect('/login');
  }

  // Only staff/admin should see this page
  if (user.role === 'user') {
    redirect('/dashboard');
  }

  const supabaseForPage = getSupabaseServerClient();
  const allHolds = await fetchHoldsForStaff();

  // Only show holds that are still actionable — hide ready/canceled records.
  const holds = allHolds.filter((h: any) => h.status === 'queued');

  // Compute which hold ID is first in queue per book (holds are already ordered by placed_at asc).
  const seenQueuedBooks = new Set<string>();
  const firstInQueueIds = new Set<string>();
  for (const hold of holds) {
    if (hold.status === 'queued' && !seenQueuedBooks.has(hold.book_id)) {
      seenQueuedBooks.add(hold.book_id);
      firstInQueueIds.add(hold.id);
    }
  }

  // Check copy states per book: available (ready to mark) and on_loan (at least being borrowed)
  const queuedBookIds = [...seenQueuedBooks];
  const availableBookIds = new Set<string>();
  const onLoanBookIds = new Set<string>();
  if (queuedBookIds.length > 0) {
    const { data: copies } = await supabaseForPage
      .from('Copies')
      .select('book_id, status')
      .in('book_id', queuedBookIds);

    for (const copy of copies ?? []) {
      const c = copy as any;
      if (c.status === 'available') availableBookIds.add(c.book_id);
      if (c.status === 'on_loan')   onLoanBookIds.add(c.book_id);
    }
  }

  // Holds where the book has no copies at all (or none on loan) — these are stuck
  const stuckHolds = holds.filter((h: any) => !onLoanBookIds.has(h.book_id) && !availableBookIds.has(h.book_id));
  const activeHolds = holds.filter((h: any) => onLoanBookIds.has(h.book_id) || availableBookIds.has(h.book_id));

  return (
    <main className="space-y-8">
      <title>Manage Holds | Dashboard</title>

      <DashboardTitleBar
        subtitle="Holds"
        title="Manage Holds"
        description="View the reservation queue for each book and mark holds as ready or cancelled."
      />

      {/* Stuck holds warning */}
      {stuckHolds.length > 0 && (
        <section className="space-y-3">
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              {stuckHolds.length} hold{stuckHolds.length !== 1 ? 's' : ''} cannot be fulfilled
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              The following books have no copies currently on loan or available in the system. These holds should be cancelled.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-900/50 dark:bg-slate-900">
            <table className="min-w-full text-sm text-slate-900 dark:text-slate-100">
              <thead className="bg-amber-50 dark:bg-slate-900">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Patron</th>
                  <th className="px-4 py-3">Placed at</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stuckHolds.map((hold: any) => (
                  <tr key={hold.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {hold.book_cover ? (
                          <img src={hold.book_cover} alt="" className="h-10 w-8 rounded object-cover ring-1 ring-slate-300 dark:ring-slate-700" />
                        ) : (
                          <div className="h-10 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                        )}
                        <div>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{hold.book_title ?? 'Unknown title'}</span>
                          <p className="text-xs text-amber-600 dark:text-amber-400">No copies in system</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-slate-200">{hold.patron_name ?? 'Unknown patron'}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                      {hold.placed_at ? new Date(hold.placed_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <form action={cancelHold}>
                          <input type="hidden" name="holdId" value={hold.id} />
                          <button type="submit" className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30">
                            Cancel hold
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-100">Pending holds</h2>
          <p className="text-sm text-swin-charcoal/60 dark:text-slate-400">
            {activeHolds.length} queued
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-sm text-slate-900 dark:text-slate-100">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Patron</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed at</th>
                <th className="px-4 py-3">Ready / Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeHolds.map((hold: any) => (
                <tr key={hold.id} className="border-t border-slate-100 dark:border-slate-800">
                  {/* Book */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {hold.book_cover ? (
                        <img
                          src={hold.book_cover}
                          alt=""
                          className="h-10 w-8 rounded object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                        />
                      ) : (
                        <div className="h-10 w-8 rounded bg-slate-200 dark:bg-slate-800" />
                      )}
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {hold.book_title ?? 'Unknown title'}
                      </span>
                    </div>
                  </td>

                  {/* Patron */}
                  <td className="px-4 py-3">
                    <span className="text-slate-900 dark:text-slate-200">
                      {hold.patron_name ?? 'Unknown patron'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {hold.status}
                    </span>
                  </td>

                  {/* Placed at */}
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                    {hold.placed_at
                      ? new Date(hold.placed_at).toLocaleString()
                      : '—'}
                  </td>

                  {/* Ready / Expires */}
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                    {hold.ready_at ? (
                      <>
                        Ready:{' '}
                        {new Date(hold.ready_at).toLocaleString()}
                        <br />
                        Expires:{' '}
                        {hold.expires_at
                          ? new Date(hold.expires_at).toLocaleString()
                          : '—'}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {hold.status === 'queued' && firstInQueueIds.has(hold.id) && (
                        <MarkReadyButton
                          holdId={hold.id}
                          patronId={hold.patron_id}
                          bookId={hold.book_id}
                          bookTitle={hold.book_title ?? ''}
                          action={markReady}
                          available={availableBookIds.has(hold.book_id)}
                        />
                      )}

                      {(hold.status === 'queued' || hold.status === 'ready') && (
                        <form action={cancelHold}>
                          <input type="hidden" name="holdId" value={hold.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {activeHolds.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No pending holds.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
