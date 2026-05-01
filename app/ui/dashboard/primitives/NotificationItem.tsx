'use client';

import clsx from 'clsx';
import {
  BookmarkIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import type { NotificationType } from '@/app/lib/supabase/notifications';
import type { ComponentType, SVGProps, ReactNode } from 'react';

type IconSpec = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  text: string;
  bg: string;
};

const TYPE_STYLES: Record<NotificationType, IconSpec> = {
  hold_ready:     { icon: BookmarkIcon,              text: 'text-primary dark:text-dark-primary', bg: 'bg-primary/10 dark:bg-dark-primary/15' },
  hold_placed:    { icon: BookmarkIcon,              text: 'text-accent-teal',                    bg: 'bg-accent-teal/10' },
  due_soon:       { icon: ClockIcon,                 text: 'text-warning',                        bg: 'bg-warning/10' },
  checkout:       { icon: ArrowRightOnRectangleIcon, text: 'text-accent-amber',                   bg: 'bg-accent-amber/12' },
  checkin:        { icon: CheckCircleIcon,           text: 'text-success',                        bg: 'bg-success/10' },
  loan_confirmed: { icon: CheckCircleIcon,           text: 'text-success',                        bg: 'bg-success/10' },
};

const FALLBACK: IconSpec = {
  icon: InformationCircleIcon,
  text: 'text-muted dark:text-on-dark-soft',
  bg: 'bg-surface-cream-strong dark:bg-dark-surface-strong',
};

type NotificationItemProps = {
  type: NotificationType | string;
  title: string;
  body: string;
  timeLabel: string;
  read: boolean;
  onClick?: () => void;
  expanded?: boolean;
  details?: ReactNode;
};

export default function NotificationItem({
  type,
  title,
  body,
  timeLabel,
  read,
  onClick,
  expanded = false,
  details,
}: NotificationItemProps) {
  const style = TYPE_STYLES[type as NotificationType] ?? FALLBACK;
  const Icon = style.icon;

  return (
    <div
      className={clsx(
        'relative border-b border-hairline transition-colors dark:border-dark-hairline',
        !read && 'border-l-4 border-l-primary bg-primary/5 dark:border-l-dark-primary dark:bg-dark-primary/10',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition hover:bg-surface-soft dark:hover:bg-dark-surface-soft"
      >
        <span
          className={clsx(
            'mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
            style.bg,
            style.text,
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={clsx(
                'font-sans text-title-sm text-ink dark:text-on-dark',
                !read && 'font-semibold',
              )}
            >
              {title}
            </p>
            <span className="flex-shrink-0 font-sans text-caption text-muted-soft dark:text-on-dark-soft">
              {timeLabel}
            </span>
          </div>
          <p className="mt-1 font-sans text-body-sm text-body dark:text-on-dark-soft">
            {body}
          </p>
        </div>
      </button>
      {expanded && details && (
        <div className="border-t border-hairline bg-surface-soft px-5 py-4 dark:border-dark-hairline dark:bg-dark-surface-soft">
          {details}
        </div>
      )}
    </div>
  );
}
