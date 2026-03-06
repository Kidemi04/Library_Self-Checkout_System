import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import clsx from 'clsx';

// Import sub pages as components
import FriendsPage from './friends/page';
import CommunitiesPage from './communities/page';

export default async function SocialPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
    tab?: string;
    query?: string;
  }>;
}) {
  const params = await searchParams;
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  const section = params.section || 'friends'; // friends | communities

  const tabClass = (active: boolean) =>
    clsx(
        'flex-1 h-full flex items-center justify-center text-base md:text-lg font-semibold rounded-full transition-all text-center relative z-10',
        active
            ? 'text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
    );

  return (
    <main className="w-full space-y-8">
        <title>Social</title>

      {/* Content */}
      <Suspense fallback={null}>
        {section === 'friends' ? (
          <FriendsPage searchParams={Promise.resolve(params)} />
        ) : (
          <CommunitiesPage searchParams={Promise.resolve(params)} />
        )}
      </Suspense>
    </main>
  );
}
