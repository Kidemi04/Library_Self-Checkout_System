// app/dashboard/holds/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchHoldsForStaff, updateHoldStatus } from '@/app/lib/supabase/queries';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createUserNotification } from '@/app/lib/supabase/notifications';
import AdminShell from '@/app/ui/dashboard/adminShell';
import HoldsManagementView from '@/app/ui/dashboard/staff/holdsManagementView';

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

  // Show queued + ready holds (both actionable from this screen).
  const holds = allHolds.filter((h: any) => h.status === 'queued' || h.status === 'ready');

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
  const stuckHolds = holds.filter((h: any) =>
    h.status === 'queued' && !onLoanBookIds.has(h.book_id) && !availableBookIds.has(h.book_id),
  );
  const mainHolds = holds.filter((h: any) =>
    h.status === 'ready' || onLoanBookIds.has(h.book_id) || availableBookIds.has(h.book_id),
  );

  return (
    <>
      <title>Manage Holds | Dashboard</title>

      <AdminShell
        titleSubtitle="Holds Management"
        title="Manage Holds"
        description="View the reservation queue for each book and mark holds as ready or cancelled."
      >
        <div className="space-y-8">
          {/* Stuck holds warning */}
          {stuckHolds.length > 0 && (
            <section className="space-y-3">
              <div className="rounded-card border-l-[3px] border border-warning/40 border-l-warning bg-warning/10 px-4 py-3">
                <p className="font-sans text-caption-uppercase font-bold text-warning">
                  Attention required
                </p>
                <p className="mt-1 font-sans text-title-md font-semibold text-ink dark:text-on-dark">
                  {stuckHolds.length} hold{stuckHolds.length !== 1 ? 's' : ''} cannot be fulfilled
                </p>
                <p className="mt-0.5 font-sans text-body-sm text-warning">
                  The following books have no copies currently on loan or available in the system.
                  These holds should be cancelled.
                </p>
              </div>
              <div className="overflow-hidden rounded-card border border-hairline dark:border-dark-hairline bg-surface-card dark:bg-dark-surface-card">
                <table className="min-w-full font-sans text-body-sm text-ink dark:text-on-dark">
                  <thead>
                    <tr className="bg-warning/5 text-left font-sans text-caption-uppercase text-ink dark:text-on-dark">
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Patron</th>
                      <th className="px-4 py-3">Placed at</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stuckHolds.map((hold: any) => (
                      <tr key={hold.id} className="border-t border-hairline-soft dark:border-dark-hairline">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {hold.book_cover ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={hold.book_cover}
                                alt=""
                                className="h-10 w-7 rounded object-cover ring-1 ring-hairline dark:ring-dark-hairline"
                              />
                            ) : (
                              <div className="h-10 w-7 rounded bg-surface-cream-strong dark:bg-dark-surface-strong" />
                            )}
                            <div>
                              <p className="font-display text-title-md font-semibold tracking-tight">
                                {hold.book_title ?? 'Unknown title'}
                              </p>
                              <p className="font-mono text-code text-warning">
                                No copies in system
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-sans text-body-sm">{hold.patron_name ?? 'Unknown patron'}</td>
                        <td className="px-4 py-3 font-mono text-code text-muted-soft dark:text-on-dark-soft">
                          {hold.placed_at ? new Date(hold.placed_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <form action={cancelHold}>
                              <input type="hidden" name="holdId" value={hold.id} />
                              <button
                                type="submit"
                                className="rounded-btn border border-primary/30 bg-primary/5 px-3 py-1.5 font-sans text-button text-primary transition hover:bg-primary/10 dark:border-dark-primary/30 dark:bg-dark-primary/10 dark:text-dark-primary dark:hover:bg-dark-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:focus-visible:ring-offset-dark-canvas"
                              >
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

          <HoldsManagementView
            holds={mainHolds as any}
            firstInQueueIds={[...firstInQueueIds]}
            availableBookIds={[...availableBookIds]}
            markReadyAction={markReady}
            cancelHoldAction={cancelHold}
          />
        </div>
      </AdminShell>
    </>
  );
}
