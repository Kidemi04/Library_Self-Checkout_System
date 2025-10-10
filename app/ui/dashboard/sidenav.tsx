import Link from 'next/link';
import clsx from 'clsx';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

type SideNavProps = {
  user: DashboardUserProfile;
  isBypassed: boolean;
};

export default function SideNav({ user, isBypassed }: SideNavProps) {
  const isStaff = user.role === 'staff';

  return (
    <aside
      className={clsx(
        'flex h-full flex-col rounded-2xl px-3 py-5 shadow-xl md:rounded-l-none md:rounded-r-2xl md:px-4',
        isStaff ? 'bg-slate-900/90 text-slate-100 ring-1 ring-white/10' : 'bg-swin-charcoal text-swin-ivory',
      )}
    >
      <Link
        className="mb-8 flex items-center gap-3 rounded-xl bg-swin-red px-4 py-3 text-swin-ivory shadow-lg shadow-swin-red/30 transition hover:bg-swin-red/90"
        href="/"
      >
        <div className="text-swin-ivory">
          <AcmeLogo />
        </div>
        <span className="hidden text-sm font-semibold uppercase tracking-wide md:block">
          Library Self-Checkout
        </span>
      </Link>
      <div className="flex grow flex-col justify-between gap-6">
        <nav className="flex flex-col gap-2">
          {isStaff ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-slate-100 shadow-inner">
              <p className="text-[11px] uppercase tracking-wide text-white/60">Admin access</p>
              <p className="mt-1 text-sm font-semibold">
                {user.name ?? user.email ?? 'Librarian'}
              </p>
              {user.email ? <p className="text-[11px] text-white/60">{user.email}</p> : null}
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">
                {isBypassed ? 'Dev bypass active' : 'Role: Staff'}
              </p>
            </div>
          ) : null}
          <NavLinks role={user.role} />
        </nav>
        <Link
          href="/login"
          className={clsx(
            'flex h-[48px] items-center justify-center gap-2 rounded-md bg-transparent text-sm font-medium transition md:justify-start md:px-3',
            isStaff
              ? 'border border-white/20 text-slate-100/80 hover:bg-white/10 hover:text-white'
              : 'border border-swin-red/40 text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory',
          )}
        >
          <PowerIcon className="w-5" />
          <span className="hidden md:block">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
