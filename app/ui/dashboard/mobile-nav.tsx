'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between bg-swin-charcoal px-4 py-3 text-swin-ivory shadow-md md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-md border border-swin-ivory/20 p-2 text-swin-ivory transition hover:bg-swin-ivory/10"
          aria-label="Open navigation menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <AcmeLogo />
          <span className="text-sm font-semibold uppercase tracking-wide">Self-Checkout</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-swin-ivory/20 px-3 py-1 text-xs font-semibold text-swin-ivory transition hover:bg-swin-ivory hover:text-swin-red"
        >
          <PowerIcon className="h-4 w-4" />
          <span>Sign Out</span>
        </Link>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden" aria-modal="true" role="dialog">
          <div className="h-full w-72 max-w-[80vw] bg-swin-charcoal px-4 py-5 text-swin-ivory shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AcmeLogo />
                <span className="text-sm font-semibold uppercase tracking-wide">Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-swin-ivory/20 p-2 text-swin-ivory transition hover:bg-swin-ivory/10"
                aria-label="Close navigation menu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              <NavLinks onNavigate={() => setOpen(false)} showLabels />
            </nav>
            <div className="mt-8">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex h-[44px] items-center justify-center gap-2 rounded-md border border-swin-red/40 text-sm font-medium text-swin-ivory/80 transition hover:bg-swin-red hover:text-swin-ivory"
              >
                <PowerIcon className="h-5 w-5" />
                <span>Sign Out</span>
              </Link>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="h-full flex-1 cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </div>
      ) : null}
    </>
  );
}
