// app/dashboard/holds/page.tsx
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchHoldsForStaff, updateHoldStatus } from '@/app/lib/supabase/queries';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

// ---------- server actions ----------

async function markReady(formData: FormData) {
  'use server';

  const holdId = formData.get('holdId') as string | null;
  const patronId = formData.get('patronId') as string | null;
  const bookTitle = formData.get('bookTitle') as string | null;

  if (!holdId || !patronId) return;

  const now = new Date();
  const expires = new Date(now);
  expires.setDate(expires.getDate() + 3); // e.g. 3-day pickup window

  // 1) Update hold status + timestamps
  await updateHoldStatus(holdId, {
    status: 'READY',
    ready_at: now.toISOString(),
    expires_at: expires.toISOString(),
  });

  // 2) Enqueue notification job in notification_queue
  const supabase = getSupabaseServerClient();

  await supabase.from('notification_queue').insert({
    patron_id: patronId,
    hold_id: holdId,
    loan_id: null,
    // ⚠ Make sure these enum values match your Supabase enums exactly
    type: 'HOLD_READY',    // notification_type enum value
    channel: 'IN_APP',     // notification_channel enum value (or 'EMAIL' etc)
    title: 'Your hold is ready for pickup',
    body: bookTitle
      ? `Your hold for "${bookTitle}" is ready for pickup. Please collect it before ${expires.toLocaleDateString()}.`
      : `One of your holds is ready for pickup. Please collect it before ${expires.toLocaleDateString()}.`,
    payload: {
      kind: 'HOLD_READY',
      hold_id: holdId,
      book_title: bookTitle,
      expires_at: expires.toISOString(),
    } as any,              // cast to any so TS is happy with JSONB
    status: 'PENDING',     // notification_status enum value
    scheduled_for: now.toISOString(),
  });

  // 3) Refresh staff holds page
  revalidatePath('/dashboard/holds');
}

async function cancelHold(formData: FormData) {
  'use server';

  const holdId = formData.get('holdId') as string | null;
  if (!holdId) return;

  await updateHoldStatus(holdId, {
    status: 'CANCELED',
    ready_at: null,
    expires_at: null,
    fulfilled_by_copy_id: null,
  });

  revalidatePath('/dashboard/holds');
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

  const holds = await fetchHoldsForStaff();

  return (
    <main className="space-y-8">
      <title>Manage Holds | Dashboard</title>

      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Manage Holds</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          View the reservation queue for each book and mark holds as ready or cancelled.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-swin-charcoal">All holds</h2>
          <p className="text-sm text-swin-charcoal/60">
            {holds.length} record{holds.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Patron</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed at</th>
                <th className="px-4 py-3">Ready / Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {holds.map((hold: any) => (
                <tr key={hold.id} className="border-t border-slate-100">
                  {/* Book */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {hold.book_cover ? (
                        <img
                          src={hold.book_cover}
                          alt=""
                          className="h-10 w-8 rounded object-cover ring-1 ring-slate-300"
                        />
                      ) : (
                        <div className="h-10 w-8 rounded bg-slate-200" />
                      )}
                      <span className="font-medium text-slate-900">
                        {hold.book_title ?? 'Unknown title'}
                      </span>
                    </div>
                  </td>

                  {/* Patron */}
                  <td className="px-4 py-3">
                    <span className="text-slate-900">
                      {hold.patron_name ?? 'Unknown patron'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {hold.status}
                    </span>
                  </td>

                  {/* Placed at */}
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {hold.placed_at
                      ? new Date(hold.placed_at).toLocaleString()
                      : '—'}
                  </td>

                  {/* Ready / Expires */}
                  <td className="px-4 py-3 text-xs text-slate-600">
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
                      {hold.status === 'QUEUED' && (
                        <form action={markReady}>
                          <input type="hidden" name="holdId" value={hold.id} />
                          <input
                            type="hidden"
                            name="patronId"
                            value={hold.patron_id}
                          />
                          <input
                            type="hidden"
                            name="bookTitle"
                            value={hold.book_title ?? ''}
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                          >
                            Mark ready
                          </button>
                        </form>
                      )}

                      {(hold.status === 'QUEUED' || hold.status === 'READY') && (
                        <form action={cancelHold}>
                          <input type="hidden" name="holdId" value={hold.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {holds.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No holds yet.
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
