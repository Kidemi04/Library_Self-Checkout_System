'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

export default function MobileNav({ user, isBypassed }: { user: DashboardUserProfile; isBypassed: boolean }) {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const isStaff = user.role === 'staff';

  const showMenu = () => {
    setRenderMenu(true);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => setOpen(true));
    } else {
      setOpen(true);
    }
  };

  const hideMenu = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!renderMenu) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideMenu();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [renderMenu]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.removeProperty('overflow');
      };
    }

    if (renderMenu) {
      const timer = window.setTimeout(() => {
        setRenderMenu(false);
        document.body.style.removeProperty('overflow');
      }, 520);

      return () => {
        window.clearTimeout(timer);
      };
    }

    document.body.style.removeProperty('overflow');
  }, [open, renderMenu]);

  return (
    <>
      <header
        className={clsx(
          'flex items-center justify-between px-4 py-3 text-swin-ivory shadow-md md:hidden',
          isStaff ? 'bg-slate-950 text-white' : 'bg-swin-ivory',
        )}
      >
        <button
          type="button"
          onClick={showMenu}
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

      {renderMenu ? (
        <div
          className={clsx(
            'fixed inset-0 z-50 flex flex-col md:hidden transition-opacity duration-300 ease-out',
            open ? 'opacity-100' : 'opacity-0',
            open ? 'pointer-events-auto' : 'pointer-events-none',
          )}
          aria-modal="true"
          role="dialog"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            className={clsx(
              'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out',
              open ? 'opacity-100' : 'opacity-0',
            )}
            onClick={hideMenu}
          />
          <div
            className={clsx(
               'relative mx-3 mt-16 max-h-[80vh] flex flex-col overflow-y-auto rounded-3xl p-6 shadow-2xl ring-1 transition-all duration-500 ease-out',
              open ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0',
              isStaff
                ? 'bg-slate-950 text-white ring-white/10'
                : 'bg-swin-charcoal text-swin-ivory ring-swin-ivory/10',
            )}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AcmeLogo />
                <span className="text-sm font-semibold uppercase tracking-wide">Navigation</span>
              </div>
              <button
                type="button"
                onClick={hideMenu}
                className={clsx(
                  'rounded-full border p-2 transition',
                  isStaff
                    ? 'border-white/15 text-white hover:bg-white/10'
                    : 'border-swin-ivory/20 text-swin-ivory hover:bg-swin-ivory/10',
                )}
                aria-label="Close navigation menu"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {isStaff ? (
              <div className="mb-6 rounded-xl border border-white/15 bg-white/5 p-4 shadow-inner shadow-black/10">
                <p className="text-[11px] uppercase tracking-wide text-white/60">Admin access</p>
                <p className="mt-1 text-sm font-semibold">{user.name ?? user.email ?? 'Librarian'}</p>
                {user.email ? <p className="text-[11px] text-white/60">{user.email}</p> : null}
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-emerald-300/80">
                  {isBypassed ? 'Dev bypass active' : 'Role: Staff'}
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-swin-ivory/15 bg-swin-ivory/10 p-4 text-xs text-swin-ivory/80">
                <p className="font-semibold text-swin-ivory">{user.name ?? 'Library Member'}</p>
                {user.email ? <p className="mt-1">{user.email}</p> : null}
              </div>
            )}
            <nav className="flex flex-col gap-2">
              <NavLinks role={user.role} onNavigate={hideMenu} showLabels />
            </nav>
            <div className="mt-10">
              <Link
                href="/login"
                onClick={hideMenu}
                className={clsx(
                  'flex h-[46px] items-center justify-center gap-2 rounded-md border text-sm font-medium transition',
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
        </div>
      ) : null}
    </>
  );
}
