'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { signOut } from 'next-auth/react';
import { PowerIcon } from '@heroicons/react/24/outline';

export default function SignOutButton({
  className,
  labelClassName,
}: {
  className?: string;
  labelClassName?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    startTransition(async () => {
      // ⛔ stop next-auth client redirect
      await signOut({ redirect: false });

      // ✅ force server re-render (critical)
      router.refresh();
      router.push('/login');
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={clsx(
        className,
        'transition disabled:cursor-not-allowed',
        pending && 'opacity-75'
      )}
    >
      <PowerIcon className="w-5" />
      <span className={labelClassName}>
        {pending ? 'Signing out...' : 'Sign Out'}
      </span>
    </button>
  );
}
