'use client';

import clsx from 'clsx';
import {
  BookmarkIcon,
  ExclamationTriangleIcon,
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
  hold_ready:     { icon: BookmarkIcon,             text: 'text-swin-red',               bg: 'bg-swin-red/10' },
  hold_placed:    { icon: BookmarkIcon,             text: 'text-sky-600 dark:text-sky-300',    bg: 'bg-sky-500/10' },
  due_soon:       { icon: ClockIcon,                text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-500/12' },
  checkout:       { icon: ArrowRightOnRectangleIcon, text: 'text-swin-gold',              bg: 'bg-swin-gold/12' },
  checkin:        { icon: CheckCircleIcon,          text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
  loan_confirmed: { icon: CheckCircleIcon,          text: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
};

const FALLBACK: IconSpec = {
  icon: InformationCircleIcon,
  text: 'text-slate-500 dark:text-slate-400',
  bg: 'bg-slate-400/10',
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
        'relative transition-colors',
        !read && 'bg-swin-red/[0.04] dark:bg-swin-red/[0.08]',
      )}
    >
      {!read && (
        <span
          aria-hidden
          className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-swin-red"
        />
      )}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition hover:bg-swin-charcoal/[0.03] dark:hover:bg-white/[0.04]"
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
                'text-[13px] leading-tight text-swin-charcoal dark:text-white',
                !read ? 'font-bold' : 'font-medium',
              )}
            >
              {title}
            </p>
            <span className="flex-shrink-0 font-mono text-[10px] text-swin-charcoal/40 dark:text-white/40">
              {timeLabel}
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-swin-charcoal/60 dark:text-white/55">
            {body}
          </p>
        </div>
      </button>
      {expanded && details && (
        <div className="border-t border-swin-charcoal/8 bg-slate-50/40 px-5 py-4 dark:border-white/8 dark:bg-white/[0.02]">
          {details}
        </div>
      )}
    </div>
  );
}
