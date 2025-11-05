import { redirect } from 'next/navigation';
import clsx from 'clsx';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobile-nav';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, isBypassed } = await getDashboardSession();
  if (!user) redirect('/login');

  const isPrivileged = user.role === 'staff' || user.role === 'admin';

  return (
    <div
      className={clsx(
        'flex min-h-screen',
        isPrivileged ? 'bg-slate-900 text-slate-100' : 'bg-swin-ivory text-swin-charcoal',
      )}
    >
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-72 md:flex-none md:flex-col">
        <SideNav user={user} isBypassed={isBypassed} />
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen w-full flex-col">
        <MobileNav user={user} isBypassed={isBypassed} />

        {/* Page surface */}
        <div
          className={clsx(
            'flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-12 md:py-10',
            isPrivileged ? 'bg-slate-900 text-slate-100' : 'bg-white/0 text-swin-charcoal',
          )}
        >
          {/* Centered, constrained container */}
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
