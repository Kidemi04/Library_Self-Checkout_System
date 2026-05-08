'use client';
import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = { from?: number; to: number; durationMs?: number; className?: string };

export function XPCounter({ from = 0, to, durationMs = 700, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? to : from);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, durationMs, reduced]);

  return <span className={className}>{value}</span>;
}
