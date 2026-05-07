'use client';

import clsx from 'clsx';
import {
  BookmarkIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  StarIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
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
  flagged?: boolean;
  onClick?: () => void;
  onToggleFlag?: () => void;
  onToggleRead?: () => void;
  expanded?: boolean;
  details?: ReactNode;
};

export default function NotificationItem({
  type,
  title,
  body,
  timeLabel,
  read,
  flagged = false,
  onClick,
  onToggleFlag,
  onToggleRead,
  expanded = false,
  details,
}: NotificationItemProps) {
  const style = TYPE_STYLES[type as NotificationType] ?? FALLBACK;
  const Icon = style.icon;
  const hasActions = onToggleFlag || onToggleRead;

  return (
    <div
      className={clsx(
        'group relative border-b border-hairline transition-colors last:border-b-0 dark:border-dark-hairline',
        !read && 'border-l-4 border-l-primary bg-primary/5 dark:border-l-dark-primary dark:bg-dark-primary/10',
      )}
    >
      <div className="flex items-start transition-colors hover:bg-surface-soft dark:hover:bg-dark-surface-soft">
        {/* Main expand button */}
        <button
          type="button"
          onClick={onClick}
          className="flex flex-1 items-start gap-3.5 px-5 py-4 text-left"
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
            <p
              className={clsx(
                'font-sans text-title-sm text-ink dark:text-on-dark',
                !read && 'font-semibold',
              )}
            >
              {title}
            </p>
            <p className="mt-1 font-sans text-body-sm text-body dark:text-on-dark-soft">{body}</p>
          </div>
        </button>

        {/* Time + hover action buttons */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2 px-4 py-4">
          <span className="font-sans text-caption text-muted-soft dark:text-on-dark-soft">
            {timeLabel}
          </span>
          {hasActions && (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              {onToggleFlag && (
                <button
                  type="button"
                  onClick={onToggleFlag}
                  title={flagged ? 'Remove flag' : 'Flag'}
                  className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong"
                >
                  {flagged
                    ? <StarSolid className="h-3.5 w-3.5 text-warning" />
                    : <StarIcon className="h-3.5 w-3.5 text-muted-soft dark:text-on-dark-soft" />
                  }
                </button>
              )}
              {onToggleRead && (
                <button
                  type="button"
                  onClick={onToggleRead}
                  title={read ? 'Mark as unread' : 'Mark as read'}
                  className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong"
                >
                  {read
                    ? <EnvelopeIcon className="h-3.5 w-3.5 text-muted-soft dark:text-on-dark-soft" />
                    : <EnvelopeOpenIcon className="h-3.5 w-3.5 text-primary dark:text-dark-primary" />
                  }
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && details && (
        <div className="border-t border-hairline bg-surface-soft px-5 py-4 dark:border-dark-hairline dark:bg-dark-surface-soft">
          {details}
        </div>
      )}
    </div>
  );
}
