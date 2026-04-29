'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { LinkedInLearningTopicCollection } from '@/app/lib/linkedin/types';
import LinkedInLearningCourseCard from './courseCard';

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

function CollectionSection({
  definition,
  result,
  browseHref,
  index,
}: {
  definition: LinkedInLearningTopicCollection['definition'];
  result: LinkedInLearningTopicCollection['result'];
  browseHref: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 rounded-card border border-hairline bg-surface-card p-8 dark:border-dark-hairline dark:bg-dark-surface-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
            Spotlight topic
          </p>
          <h3 className="font-display text-display-sm text-ink dark:text-on-dark">{definition.title}</h3>
          {definition.description ? (
            <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">{definition.description}</p>
          ) : null}
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href={browseHref}
            className="rounded-pill border border-hairline bg-canvas px-4 py-2 font-sans text-body-sm font-medium text-ink transition hover:border-primary/20 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
          >
            Browse all
          </Link>
        </motion.div>
      </div>

      {result.items.length > 0 ? (
        <motion.div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } }, hidden: {} }}
        >
          {result.items.map((course) => (
            <motion.div key={course.urn} variants={cardVariant}>
              <LinkedInLearningCourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="rounded-card border border-dashed border-hairline bg-canvas p-6 font-sans text-body-sm text-muted dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark-soft">
          No courses found for this topic. Try the search form above.
        </div>
      )}
    </motion.div>
  );
}

type Props = {
  collections: Array<LinkedInLearningTopicCollection & { provider: string; label: string }>;
  difficulty: string;
};

const buildBrowseHref = (query: string, difficulty: string) => {
  const params = new URLSearchParams();
  params.set('q', query);
  if (difficulty && difficulty !== 'ALL') params.set('difficulty', difficulty);
  return `/dashboard/learning/linkedin?${params.toString()}`;
};

export default function CollectionsPanel({ collections, difficulty }: Props) {
  if (!collections.length) {
    return (
      <div className="rounded-card border border-dashed border-hairline bg-surface-card p-6 text-center font-sans text-body-sm text-muted dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft">
        No courses found. Try the search form above.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {collections.map(({ definition, result }, index) => (
        <CollectionSection
          key={definition.key}
          definition={definition}
          result={result}
          browseHref={buildBrowseHref(definition.query, difficulty)}
          index={index}
        />
      ))}
    </div>
  );
}
