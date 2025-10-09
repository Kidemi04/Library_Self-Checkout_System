import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SideNav from '@/app/ui/dashboard/sidenav';
import MobileNav from '@/app/ui/dashboard/mobile-nav';

export default async function Layout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') {
    const session = await auth();
    if (!session?.user) {
      redirect('/login');
    }
  }

  return (
    <div className="flex min-h-screen bg-swin-ivory">
      <aside className="hidden md:flex md:w-72 md:flex-none md:flex-col">
        <SideNav />
      </aside>
      <div className="flex min-h-screen w-full flex-col">
        <MobileNav />
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-12 md:py-10">{children}</div>
      </div>
    </div>
  );
}
