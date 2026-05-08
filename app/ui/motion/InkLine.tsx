'use client';
import { motion } from 'framer-motion';
import { motionDuration, motionEase } from '@/app/lib/motion/tokens';
import { usePrefersReducedMotion } from '@/app/lib/motion/reduced-motion';

type Props = {
  d: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  duration?: keyof typeof motionDuration;
  className?: string;
};

export function InkLine({
  d,
  width = 200,
  height = 14,
  strokeWidth = 1.5,
  duration = 'paper',
  className,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const dur = reduced ? motionDuration.instant : motionDuration[duration];

  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: reduced ? 1 : 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: dur, ease: motionEase.inkWrite }}
      />
    </svg>
  );
}
