'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { motionSpring, motionDuration } from '@/app/lib/motion/tokens';
import { resolveAllMilestoneColors } from '@/app/lib/motion/resolveColorToken';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export type MilestonePayload = {
  kind:
    | 'first_borrow'
    | 'first_on_time_return'
    | 'books_milestone_5'
    | 'books_milestone_10'
    | 'books_milestone_25'
    | 'books_milestone_50'
    | 'all_overdues_cleared';
  display: string;
};

type Props = {
  trigger: boolean;
  milestone?: MilestonePayload;
  onClose?: () => void;
};

export function MilestoneBurst({ trigger, milestone, onClose }: Props) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!trigger || !milestone) return;
    if (!reduced) {
      confetti({
        particleCount: 65,
        spread: 85,
        startVelocity: 32,
        gravity: 0.8,
        ticks: 200,
        origin: { x: 0.5, y: 0.55 },
        colors: resolveAllMilestoneColors(),
      });
    }
    const t = setTimeout(() => onClose?.(), 1200);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [trigger, milestone, onClose, reduced]);

  return (
    <AnimatePresence>
      {trigger && milestone && (
        <motion.div
          role="status"
          aria-live="polite"
          data-testid="milestone-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 cursor-pointer"
          onClick={() => onClose?.()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: motionDuration.quick } }}
          transition={{ duration: motionDuration.quick }}
        >
          <motion.div
            className="bg-canvas border border-hairline rounded-hero px-12 py-10 shadow-2xl text-center max-w-md"
            initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={reduced ? { duration: motionDuration.instant } : motionSpring.milestone}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-display-md font-display text-primary mb-2">✓</div>
            <p className="text-display-sm font-display text-ink">{milestone.display}</p>
            <p className="text-caption text-muted mt-3">tap anywhere to dismiss</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
