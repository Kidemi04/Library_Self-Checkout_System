import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isBypassed } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'staff') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-swin-red via-rose-700 to-slate-900 px-8 py-6 text-swin-ivory shadow-2xl shadow-swin-red/30">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-swin-ivory/60">Admin Control Center</p>
            <h1 className="mt-3 text-2xl font-semibold">
              Good day, {user.name ?? 'Librarian'}
            </h1>
            {user.email ? <p className="mt-2 text-sm text-swin-ivory/80">{user.email}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-xs text-white/80 shadow-inner shadow-black/20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
              Role: Staff
            </span>
            <p className="text-xs leading-relaxed text-white/80">
              Full catalogue and circulation access enabled for this session.
            </p>
            {isBypassed ? (
              <p className="inline-flex items-center gap-2 rounded-md bg-amber-400/25 px-3 py-1 text-[11px] font-semibold text-amber-100">
                Development bypass active
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-8">{children}</div>
    </div>
  );
}
