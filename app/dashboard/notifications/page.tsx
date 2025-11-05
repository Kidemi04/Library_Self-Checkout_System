import clsx from 'clsx';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function NotificationsPage() {
  const { user } = await getDashboardSession();
  const isPrivileged = user?.role === 'staff' || user?.role === 'admin';

  return (
    <main className="space-y-6">
      <header
        className={clsx(
          'rounded-2xl border p-6 shadow-sm',
          isPrivileged
            ? 'border-white/15 bg-slate-950/60 text-white shadow-black/20'
            : 'border-swin-charcoal/10 bg-white text-swin-charcoal shadow-swin-charcoal/10',
        )}
      >
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p
          className={clsx(
            'mt-2 text-sm',
            isPrivileged ? 'text-slate-300/70' : 'text-swin-charcoal/60',
          )}
        >
          Alerts about due dates, holds, and system updates will appear here. Stay tuned!
        </p>
      </header>
    </main>
  );
}
