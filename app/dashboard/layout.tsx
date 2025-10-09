import { redirect } from 'next/navigation';
import clsx from 'clsx';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobile-nav';
import { getDashboardSession } from '@/app/lib/auth/session';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user, isBypassed } = await getDashboardSession();

  if (!user) {
    redirect('/login');
  }

  const isStaff = user.role === 'staff';

  return (
    <div
      className={clsx(
        'flex min-h-screen',
        isStaff
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-swin-ivory text-swin-charcoal',
      )}
    >
      <aside className="hidden md:flex md:w-72 md:flex-none md:flex-col md:px-2 md:py-3">
        <SideNav user={user} isBypassed={isBypassed} />
      </aside>
      <div className="flex min-h-screen w-full flex-col">
        <MobileNav user={user} isBypassed={isBypassed} />
        <div
          className={clsx(
            'flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-12 md:py-10',
            isStaff
              ? 'bg-slate-900/40 text-slate-100 backdrop-blur'
              : 'bg-transparent text-swin-charcoal',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
