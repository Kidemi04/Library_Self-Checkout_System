'use client';

import { useTransition } from 'react';
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

  const handleClick = () => {
    startTransition(async () => {
      // Clear the NextAuth session cookie
      await signOut({ redirect: false });
      // Then end the Azure AD SSO session so the next sign-in shows the account picker
      window.location.href = '/api/auth/azure-signout';
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
