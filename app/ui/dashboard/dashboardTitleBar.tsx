'use client';

import BlurFade from '@/app/ui/magicUi/blurFade';
import { ReactNode } from 'react';

/**
 * Dashboard title bar
 * Fixed: Added responsive padding and layout to prevent content overflow on mobile
 */
type DashboardTitleBarProps = {
  subtitle: string;        // Small uppercase label
  title: string;           // Main heading
  description: string;     // Supporting text
  rightSlot?: ReactNode;   // Optional right content
};

export default function DashboardTitleBar({
  subtitle,
  title,
  description,
  rightSlot,
}: DashboardTitleBarProps) {
  return (
    <header
      className="
        relative gap-6 overflow-hidden rounded-3xl
        border border-swin-charcoal/10
        bg-gradient-to-r from-swin-charcoal via-swin-red to-[#3b0b14]
        /* Mobile: smaller padding | Desktop: p-8 */
        p-5 md:p-8 
        text-white
        shadow-2xl shadow-swin-red/30
        /* Mobile: single column (default) | Desktop: grid with specific width */
        grid-cols-1 md:grid-cols-[1fr_minmax(0,260px)] md:items-center
      "
    >
      {/* Decorative blur background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-swin-red/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-black/20 blur-3xl" />
      </div>

      {/* Left: title content */}
      <BlurFade delay={0.1} yOffset={10}>
        <div className="relative z-10 pt-1 md:pt-2">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/70">
            {subtitle}
          </p>

          <h1 className="mt-2 md:mt-3 text-xl md:text-2xl font-semibold leading-tight">
            {title}
          </h1>

          <p className="mt-2 md:mt-3 max-w-3xl text-xs md:text-sm text-white/80 leading-relaxed">
            {description}
          </p>
        </div>
      </BlurFade>

      {/* Right: optional slot */}
      {rightSlot && (
        <BlurFade delay={0.2} yOffset={10}>
          {/* Use w-full and min-w-0 to ensure children don't push outside the container */}
          <div className="relative z-10 w-full min-w-0">
            {rightSlot}
          </div>
        </BlurFade>
      )}
    </header>
  );
}