'use client';
import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { motionSpring, motionDistance, motionDuration } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function PaperEnter({ children, delay = 0, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const initial = reduced ? { opacity: 0 } : { opacity: 0, y: motionDistance.paperRise };
  const animate = reduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = reduced
    ? { duration: motionDuration.instant, delay }
    : { ...motionSpring.paper, delay };

  return (
    <motion.div
      data-motion="paper-enter"
      className={className}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
