import Image from 'next/image';
import Link from 'next/link';
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

  return (
    <article
      className={clsx(
        'flex h-full flex-col overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg',
        'border-swin-charcoal/10 bg-white text-swin-charcoal dark:border-white/5 dark:bg-slate-900/70 dark:text-white',
      )}
    >
      <div className="relative h-40 w-full overflow-hidden">
        {showImage ? (
          <Image
            src={course.imageUrl as string}
            alt={course.title}
            fill
            sizes="(min-width: 768px) 260px, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-swin-charcoal via-swin-red to-slate-900 text-white">
            <PlayCircleIcon className="h-12 w-12 text-white/80" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-swin-charcoal shadow">
          {course.contentType === 'VIDEO'
            ? 'Video'
            : course.contentType === 'LEARNING_PATH'
            ? 'Learning Path'
            : 'Course'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">{course.title}</h3>
          {course.description ? (
            <p className="line-clamp-3 text-sm text-swin-charcoal/70 dark:text-slate-300/80">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-swin-charcoal/70 dark:text-slate-300/80">
          {course.durationFormatted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-swin-charcoal/5 px-3 py-1 dark:bg-slate-700/60">
              <ClockIcon className="h-4 w-4" />
              {course.durationFormatted}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200">
            <AcademicCapIcon className="h-4 w-4" />
            {levelLabel(course.skillLevel)}
          </span>
        </div>

        {tagList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tagList.map((tag) => (
              <span
                key={`${course.urn}-${tag}`}
                className="rounded-full bg-swin-red/10 px-3 py-1 text-xs font-medium text-swin-red dark:bg-swin-red/20 dark:text-rose-200"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          {authorLabel ? (
            <p className="text-swin-charcoal/60 dark:text-slate-300/80">
              By <span className="font-medium text-swin-charcoal dark:text-white">{authorLabel}</span>
            </p>
          ) : (
            <span className="text-swin-charcoal/50 dark:text-slate-400">LinkedIn Learning</span>
          )}

          {course.url ? (
            <Link
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-swin-red px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-swin-red/90"
            >
              View course
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
