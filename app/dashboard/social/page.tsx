import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import clsx from 'clsx';
import TabSwitch from '@/app/ui/dashboard/tab-switch';

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
        <title>Social | Dashboard</title>

        {/* Friends / Communities switch */}
        <TabSwitch
            activeKey={section}
            items={[
                {
                    key: 'friends',
                    label: 'Friends',
                    href: '/dashboard/social?section=friends',
                },
                {
                    key: 'communities',
                    label: 'Communities',
                    href: '/dashboard/social?section=communities',
                },
            ]}
            />


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
