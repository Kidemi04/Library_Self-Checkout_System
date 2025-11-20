'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { followUserAction, removeFollowerAction, unfollowUserAction } from '@/app/profile/follow-actions';

type FollowActionButtonProps = {
  targetUserId: string;
  variant: 'follow' | 'unfollow' | 'remove';
  isFollowing?: boolean;
  className?: string;
};

const baseButtonClass =
  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const getVariantClass = (variant: FollowActionButtonProps['variant'], isFollowing: boolean) => {
  if (variant === 'follow') {
    if (isFollowing) {
      return 'border border-emerald-300/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-200';
    }
    return 'bg-swin-red text-white shadow-sm hover:bg-swin-red/90 focus-visible:outline-swin-red dark:bg-emerald-500 dark:text-slate-900 dark:hover:bg-emerald-400 dark:focus-visible:outline-emerald-300';
  }
  if (variant === 'unfollow') {
    return 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-500 dark:border-white/20 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:outline-white/50';
  }
  return 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus-visible:outline-rose-400 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100 dark:hover:bg-rose-500/20';
};

const getLabel = (variant: FollowActionButtonProps['variant'], isFollowing: boolean, pending: boolean) => {
  if (variant === 'follow') {
    if (pending) return 'Following...';
    if (isFollowing) return 'Following';
    return 'Follow back';
  }
  if (variant === 'unfollow') {
    return pending ? 'Unfollowing...' : 'Unfollow';
  }
  return pending ? 'Removing...' : 'Remove';
};

const getAction = (variant: FollowActionButtonProps['variant']) => {
  if (variant === 'follow') return followUserAction;
  if (variant === 'unfollow') return unfollowUserAction;
  return removeFollowerAction;
};

export default function FollowActionButton({
  targetUserId,
  variant,
  isFollowing = false,
  className,
}: FollowActionButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (variant === 'follow' && isFollowing) return;
    startTransition(() => {
      const action = getAction(variant);
      void action(targetUserId).finally(() => {
        router.refresh();
      });
    });
  };

  return (
    <button
      type="button"
      aria-live="polite"
      onClick={handleClick}
      disabled={pending || (variant === 'follow' && isFollowing)}
      className={clsx(baseButtonClass, getVariantClass(variant, isFollowing), className)}
    >
      {getLabel(variant, isFollowing, pending)}
    </button>
  );
}
