'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import React from 'react';
import {
  AcademicCapIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  PlayCircleIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import type { LinkedInLearningAsset } from '@/app/lib/linkedin/types';

const levelLabel = (value: LinkedInLearningAsset['skillLevel']) => {
  if (!value || value === 'ALL') return 'All levels';
  if (value === 'BEGINNER') return 'Beginner';
  if (value === 'INTERMEDIATE') return 'Intermediate';
  if (value === 'ADVANCED') return 'Advanced';
  return value;
};

type Props = {
  course: LinkedInLearningAsset;
};

export default function LinkedInLearningCourseCard({ course }: Props) {
  const showImage = typeof course.imageUrl === 'string' && course.imageUrl.trim().length > 0;
  const authorLabel =
    course.authors && course.authors.length > 0
      ? course.authors.map((author) => author.name).filter(Boolean).join(', ')
      : null;
  const tagList = Array.isArray(course.topics) ? course.topics.slice(0, 3) : [];

  const CardWrapper = course.url
    ? ({ children }: { children: React.ReactNode }) => (
        <Link href={course.url!} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col">
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => <div className="flex h-full flex-col">{children}</div>;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-card border cursor-pointer transition',
        'border-hairline bg-surface-card text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark',
        'hover:border-primary/20 dark:hover:border-dark-primary/30',
      )}
    >
      <CardWrapper>
      <div className="relative h-40 w-full overflow-hidden">
        {showImage ? (
          <Image
            src={course.imageUrl as string}
            alt={course.title}
            fill
            sizes="(min-width: 768px) 260px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-cream-strong text-primary dark:bg-dark-surface-strong dark:text-dark-primary">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PlayCircleIcon className="h-12 w-12" />
            </motion.div>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-pill bg-canvas/90 px-3 py-1 font-sans text-caption-uppercase text-ink dark:bg-dark-canvas/90 dark:text-on-dark">
          {course.contentType === 'VIDEO'
            ? 'Video'
            : course.contentType === 'LEARNING_PATH'
            ? 'Learning Path'
            : 'Course'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="font-sans text-title-md leading-tight text-ink dark:text-on-dark">{course.title}</h3>
          {course.description ? (
            <p className="line-clamp-3 font-sans text-body-sm text-muted dark:text-on-dark-soft">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {course.durationFormatted ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-surface-cream-strong px-3 py-1 font-sans text-caption text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft">
              <ClockIcon className="h-4 w-4" />
              {course.durationFormatted}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-pill bg-accent-teal/10 px-3 py-1 font-sans text-caption text-accent-teal dark:bg-accent-teal/15">
            <AcademicCapIcon className="h-4 w-4" />
            {levelLabel(course.skillLevel)}
          </span>
        </div>

        {tagList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => (
              <motion.span
                key={`${course.urn}-${tag}`}
                whileHover={{ scale: 1.08 }}
                className="rounded-pill bg-primary/10 px-3 py-1 font-sans text-caption font-medium text-primary dark:bg-dark-primary/20 dark:text-dark-primary"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2">
          {authorLabel ? (
            <p className="font-sans text-body-sm text-muted dark:text-on-dark-soft">
              By <span className="font-medium text-ink dark:text-on-dark">{authorLabel}</span>
            </p>
          ) : (
            <span className="font-sans text-body-sm text-muted-soft dark:text-on-dark-soft">Online course</span>
          )}
          <span className="inline-flex items-center gap-1 rounded-pill bg-primary px-4 py-1.5 font-sans text-caption font-semibold text-on-primary">
            View course
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
      </CardWrapper>
    </motion.article>
  );
}
