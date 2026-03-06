import { getDashboardSession } from '@/app/lib/auth/session';

export default async function NotificationsPage() {
  await getDashboardSession();

  return (
    <main className="space-y-6">
      <header className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 text-swin-charcoal shadow-swin-charcoal/10 transition-colors dark:border-white/15 dark:bg-slate-950/60 dark:text-white dark:shadow-black/20">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-swin-charcoal/60 dark:text-slate-300/80">
          Alerts about due dates, holds, and system updates will appear here. Stay tuned!
        </p>
      </header>
    </main>
  );
}
