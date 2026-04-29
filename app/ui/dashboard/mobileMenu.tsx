'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import NavLinks from '@/app/ui/dashboard/navLinks';
import SignOutButton from '@/app/ui/dashboard/signOutButton';
import type { DashboardUserProfile } from '@/app/lib/auth/types';

export default function MobileMenu({ user }: { user: DashboardUserProfile }) {
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

  // Trigger lives inside the MobileNav header (not yet migrated — still dark);
  // keeps light-text-on-dark treatment until mobileNav.tsx is migrated.
  const triggerClasses =
    'inline-flex items-center justify-center rounded-btn p-2 text-on-dark transition-colors hover:bg-on-dark/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

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
          'fixed inset-0 z-[9998] bg-black/60 transition-opacity duration-300 dark:bg-black/70 md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Slide-in drawer panel — z-[9999] sits above the backdrop */}
      <aside
        id="mobile-menu-drawer"
        aria-label="Site navigation"
        aria-hidden={!isOpen}
        className={clsx(
          'fixed inset-y-0 left-0 z-[9999] flex flex-col border-r border-hairline bg-canvas text-ink shadow-2xl transition-transform duration-300 ease-in-out dark:border-dark-hairline dark:bg-dark-canvas dark:text-on-dark md:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4 dark:border-dark-hairline">
          <button
            type="button"
            onClick={closeMenu}
            className="rounded-btn p-1.5 text-muted transition-colors hover:bg-surface-cream-strong hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-on-dark-soft dark:hover:bg-dark-surface-strong dark:hover:text-on-dark"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <span className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
            Navigation
          </span>

        </div>

        {/* Nav links — clicking any link also closes the drawer */}
        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
        >
          <NavLinks
          role={user.role}
          onNavigate={closeMenu}
          showLabels={true}/>
        </nav>

        {/* Drawer footer — Sign out */}
        <div className="border-t border-hairline px-4 py-3 dark:border-dark-hairline">
          <SignOutButton />
        </div>

        {/* Brand-colour accent stripe at the bottom of the drawer */}
        <div
          aria-hidden="true"
          className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent dark:from-dark-primary/60 dark:via-dark-primary/30"
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
