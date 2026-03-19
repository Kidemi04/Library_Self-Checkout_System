'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useTheme } from '@/app/ui/theme/theme-provider';
import NavLinks from '@/app/ui/dashboard/nav-links';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

export default function MobileMenu({ user }: { user: DashboardUserProfile }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Track whether the drawer is open or closed
  const [isOpen, setIsOpen] = React.useState(false);

  // Track whether we are mounted on the client (required for createPortal)
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Lock body scroll while the drawer is open to prevent background scrolling
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close drawer on Escape key press for accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeMenu();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Trigger button — sits inside the MobileNav header at the top-left
  const triggerClasses = clsx(
    'inline-flex items-center justify-center rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2',
    isDark
      ? 'text-slate-300 hover:bg-white/10 hover:text-white focus-visible:ring-emerald-400'
      : 'text-swin-ivory hover:bg-swin-ivory/20 hover:text-white focus-visible:ring-swin-red',
  );

  // The portal overlay — backdrop + drawer rendered directly into document.body.
  // This breaks out of any parent stacking context (transform, filter, will-change, etc.)
  // so z-index works globally and nothing in the page can obscure the drawer.
  const portalContent = (
    <>
      {/* Semi-transparent backdrop — tapping it closes the drawer */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={clsx(
          // z-[9998] ensures the backdrop sits above all page content
          'fixed inset-0 z-[9998] transition-opacity duration-300 md:hidden',
          isDark ? 'bg-slate-950/70' : 'bg-swin-charcoal/60',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Slide-in drawer panel — z-[9999] sits above the backdrop */}
      <aside
        id="mobile-menu-drawer"
        aria-label="Site navigation"
        aria-hidden={!isOpen}
        className={clsx(
          'fixed inset-y-0 left-0 z-[9999] flex flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          // Use a solid background instead of backdrop-blur to avoid creating a
          // new stacking context that could clip child elements
          isDark
            ? 'border-white/10 bg-slate-950 text-white'
            : 'border-swin-charcoal/10 bg-swin-charcoal text-white',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div
          className={clsx(
            'flex items-center justify-between border-b px-5 py-4',
            isDark ? 'border-white/10' : 'border-swin-charcoal/10',
          )}
        >
          <button
            type="button"
            onClick={closeMenu}
            className={clsx(
              'rounded-lg p-1.5 transition-colors focus:outline-none focus-visible:ring-2',
              isDark
                ? 'text-slate-400 hover:bg-white/10 hover:text-white focus-visible:ring-emerald-400'
                : 'text-white/60 hover:bg-swin-charcoal/10 hover:text-white focus-visible:ring-swin-red',
            )}
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <span
            className={clsx(
              'text-sm font-semibold uppercase tracking-widest',
              isDark ? 'text-slate-300' : 'text-white/80',
            )}
          >
            Navigation
          </span>
          
        </div>

        {/* Nav links — clicking any link also closes the drawer */}
        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
        >
          <NavLinks 
          role={user.role}
          showLabels={true}/>
        </nav>

        {/* Brand-colour accent stripe at the bottom of the drawer */}
        <div
          aria-hidden="true"
          className={clsx(
            'h-1 w-full',
            isDark
              ? 'bg-gradient-to-r from-emerald-500/60 via-emerald-400/30 to-transparent'
              : 'bg-gradient-to-r from-swin-red/60 via-swin-red/30 to-transparent',
          )}
        />
      </aside>
    </>
  );

  return (
    <>
      {/* Hamburger / close trigger button rendered in-place inside the header */}
      <button
        type="button"
        onClick={toggleMenu}
        className={triggerClasses}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Portal: mount backdrop and drawer directly into document.body so they
          are never clipped by a parent stacking context (e.g. transform, filter,
          will-change, isolation) that exists elsewhere in the component tree */}
      {mounted && createPortal(portalContent, document.body)}
    </>
  );
}