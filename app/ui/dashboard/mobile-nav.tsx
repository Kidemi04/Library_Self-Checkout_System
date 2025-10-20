'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

export default function MobileNav({ user, isBypassed }: { user: DashboardUserProfile; isBypassed: boolean }) {
  const [open, setOpen] = useState(false);
  const isStaff = user.role === 'staff';

  return (
    <>
      <header
        className={clsx(
          'flex items-center justify-between px-4 py-3 text-swin-ivory shadow-md md:hidden',
          isStaff ? 'bg-slate-950 text-white' : 'bg-swin-charcoal',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={clsx(
            'inline-flex items-center justify-center rounded-md border p-2 transition',
            isStaff
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'border-swin-ivory/20 text-swin-ivory hover:bg-swin-ivory/10',
          )}
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
          <div
            className={clsx(
              'h-[45vh] min-w-full px-4 py-5 text-swin-ivory shadow-2xl backdrop-blur-xs',
              isStaff ? 'bg-slate-950 text-white' : 'bg-swin-charcoal',
            )}
          >
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
            {isStaff ? (
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-wide text-white/60">Admin access</p>
                <p className="mt-1 text-sm font-semibold">{user.name ?? user.email ?? 'Librarian'}</p>
                {user.email ? <p className="text-[11px] text-white/60">{user.email}</p> : null}
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">
                  {isBypassed ? 'Dev bypass active' : 'Role: Staff'}
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-swin-ivory/10 bg-swin-ivory/5 p-4 text-xs text-swin-ivory/70">
                <p className="font-semibold text-swin-ivory/90">{user.name ?? 'Library Member'}</p>
                {user.email ? <p className="mt-1">{user.email}</p> : null}
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <NavLinks role={user.role} onNavigate={() => setOpen(false)} showLabels />
            </nav>
            <div className="mt-8">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={clsx(
                  'flex h-[44px] items-center justify-center gap-2 rounded-md border text-sm font-medium transition',
                  isStaff
                    ? 'border-white/20 text-white/80 hover:bg-white/10 hover:text-white'
                    : 'border-swin-red/40 text-swin-ivory/80 hover:bg-swin-red hover:text-swin-ivory',
                )}
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