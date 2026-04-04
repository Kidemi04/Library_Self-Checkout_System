'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LinkedInLearningAsset } from '@/app/lib/linkedin/types';
import LinkedInLearningCourseCard from './courseCard';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.0 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 60, scale: 0.88, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 18, mass: 0.8 },
  },
};

type Props = {
  items: LinkedInLearningAsset[];
  query: string;
};

export default function SearchResultsPanel({ items, query }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || items.length === 0) return;
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(timer);
  }, [query, items.length]);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-dashed border-swin-charcoal/20 bg-white p-8 text-center text-sm text-swin-charcoal/70 dark:border-white/20 dark:bg-slate-900/40 dark:text-slate-300/80"
      >
        No courses found for &ldquo;{query}&rdquo;. Try a different keyword.
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 scroll-mt-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {items.map((course) => (
        <motion.div key={course.urn} variants={cardVariant}>
          <LinkedInLearningCourseCard course={course} />
        </motion.div>
      ))}
    </motion.div>
  );
}
