import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <aside className="flex h-full flex-col bg-swin-charcoal px-3 py-5 text-swin-ivory shadow-xl md:px-4">
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
          <NavLinks />
        </nav>
        <Link
          href="/login"
          className="flex h-[48px] items-center justify-center gap-2 rounded-md border border-swin-red/40 bg-transparent text-sm font-medium text-swin-ivory/80 transition hover:bg-swin-red hover:text-swin-ivory md:justify-start md:px-3"
        >
          <PowerIcon className="w-5" />
          <span className="hidden md:block">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
