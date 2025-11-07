import { getDashboardSession } from '@/app/lib/auth/session';
import { getHolds } from '@/app/actions/holds';
import { HoldsTable } from '@/app/ui/dashboard/holds-table';
import { redirect } from 'next/navigation';

export default async function HoldsPage() {
  const session = await getDashboardSession();
  
  if (!session.user) {
    redirect('/login');
  }

  // Fetch both active and historical holds
  const holds = await getHolds(session.user.id);
  const activeHolds = holds.filter(hold => ['QUEUED', 'READY'].includes(hold.status));
  const holdHistory = holds.filter(hold => !['QUEUED', 'READY'].includes(hold.status));

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Holds</h1>
      </div>

      {/* Active Holds Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Active Holds</h2>
        {activeHolds.length > 0 ? (
          <HoldsTable holds={activeHolds.map(hold => ({
            id: hold.id,
            bookTitle: hold.books.title,
            status: hold.status,
            placedAt: hold.placed_at,
            readyAt: hold.ready_at,
            expiresAt: hold.expires_at
          }))} />
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500">You have no active holds.</p>
          </div>
        )}
      </div>

      {/* Hold History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Hold History</h2>
        {holdHistory.length > 0 ? (
          <HoldsTable holds={holdHistory.map(hold => ({
            id: hold.id,
            bookTitle: hold.books.title,
            status: hold.status,
            placedAt: hold.placed_at,
            readyAt: hold.ready_at,
            expiresAt: hold.expires_at
          }))} />
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500">No hold history found.</p>
          </div>
        )}
      </div>
    </div>
  );
}