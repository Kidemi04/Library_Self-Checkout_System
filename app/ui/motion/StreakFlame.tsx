'use client';
import { motion } from 'framer-motion';
import { motionSpring } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export function StreakFlame({ days, className }: { days: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <span className={className} aria-label={`Streak: ${days} days`}>
      <motion.span
        aria-hidden="true"
        style={{ display: 'inline-block', transformOrigin: 'bottom center', marginRight: 6 }}
        animate={
          reduced
            ? undefined
            : { rotate: [-5, 5, -5], scale: [1, 1.12, 1] }
        }
        transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        key={days}
        initial={reduced ? false : { scale: 0 }}
        whileInView={{ scale: 1, transition: motionSpring.milestone }}
      >
        🔥
      </motion.span>
      <span>{days} days</span>
    </span>
  );
}
