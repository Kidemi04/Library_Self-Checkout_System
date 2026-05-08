'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { motionHover } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

export function BookCardLift({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -motionHover.cardLift, transition: { duration: motionHover.duration } }}
    >
      {children}
    </motion.div>
  );
}
