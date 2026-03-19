'use client';

import Link from 'next/link';
import clsx from 'clsx';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TabItem {
  /** Display label shown inside the tab button */
  label: string;
  /** Unique value used to identify the active tab */
  value: string;
  /** URL the tab links to */
  href: string;
  /** Optional badge count rendered next to the label (e.g. friend requests) */
  count?: number;
}

interface TabSwitchProps {
  /** Array of tab definitions */
  tabs: TabItem[];
  /** The value of the currently active tab */
  activeTab: string;
  /** Optional additional className applied to the outer wrapper */
  className?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Returns the CSS translateX value that slides the highlight pill
 * to the position of the active tab.
 *
 * Each tab occupies an equal fraction of the container width, so the
 * offset is simply (activeIndex / totalTabs * 100)%.
 */
function getSliderLeft(tabs: TabItem[], activeTab: string, tabCount: number): string {
  const index = tabs.findIndex((t) => t.value === activeTab);
  const safeIndex = index < 0 ? 0 : index;
  // Each tab occupies (100/N)% of the container, offset by the p-1 (4px) padding
  return `calc(${safeIndex} * (100% - 0.5rem) / ${tabCount} + 0.25rem)`;
}


export default function TabSwitch({ tabs, activeTab, className }: TabSwitchProps) {
  return (
    <div
      className={clsx(
        // Outer pill container
        'relative bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full',
        'backdrop-blur-md flex w-full',
        className,
      )}
    >
      {/* ── Sliding highlight pill ── */}
      <div
        aria-hidden="true"
        className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
        style={{
          width: `calc((100% - 0.5rem) / ${tabs.length})`,
          left: getSliderLeft(tabs, activeTab, tabs.length),
        }}
      />

      {/* ── Tab links ── */}
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;

        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={clsx(
              // Base styles shared by all tabs
              'flex-1 px-2 py-1.5 md:px-4 md:py-2',
              'text-xs md:text-sm font-medium rounded-full',
              'transition-all duration-300 text-center relative z-10',
              'flex items-center justify-center gap-1.5',
              // Active vs. inactive colour variants
              isActive
                ? 'text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}

            {/* Optional numeric badge (e.g. pending requests count) */}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={clsx(
                  'inline-flex items-center justify-center',
                  'min-w-[1.1rem] h-[1.1rem] px-1 text-[0.6rem] font-bold rounded-full',
                  isActive
                    ? 'bg-swin-red text-white'
                    : 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
                )}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
