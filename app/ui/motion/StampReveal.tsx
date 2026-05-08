'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { motionSpring, motionDuration } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type StampKind = 'borrowed' | 'returned' | 'renewed' | 'reserved' | 'reported';

const KIND_CONFIG: Record<StampKind, { label: string; icon: string; classes: string }> = {
  borrowed: { label: 'BORROWED', icon: '✓', classes: 'text-primary border-primary bg-primary/5' },
  returned: { label: 'RETURNED', icon: '✓', classes: 'text-success border-success bg-success/5' },
  renewed:  { label: 'RENEWED',  icon: '↻', classes: 'text-accent-amber border-accent-amber bg-accent-amber/5' },
  reserved: { label: 'RESERVED', icon: '🔖', classes: 'text-accent-teal border-accent-teal bg-accent-teal/5' },
  reported: { label: 'REPORTED', icon: '⚠', classes: 'text-error border-error bg-transparent' },
};

export function StampReveal({ kind, className }: { kind: StampKind; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const cfg = KIND_CONFIG[kind];

  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 2, rotate: 22 };
  const animate = reduced ? { opacity: 0.95 } : { opacity: 0.95, scale: 1, rotate: 8 };
  const transition = reduced ? { duration: motionDuration.instant } : motionSpring.stamp;

  return (
    <motion.div
      data-testid="stamp"
      aria-hidden="true"
      className={clsx(
        'inline-flex items-center gap-2 border-2 rounded-md px-3 py-1.5',
        'font-display font-bold text-caption-uppercase tracking-[0.12em]',
        cfg.classes,
        className,
      )}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      <span>{cfg.label}</span>
    </motion.div>
  );
}
