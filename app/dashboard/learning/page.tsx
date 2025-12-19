// app/dashboard/learning/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import TabSwitch from '@/app/ui/dashboard/tab-switch';

// Sub pages
import LinkedInLearningPage from './linkedin/page';
import LearningPathsPage from './paths/page';

export default async function LearningPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = (await searchParams) ?? {};

  const normalizedParams: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(rawParams).filter(([, value]) => value !== undefined)
  ) as Record<string, string | string[]>;
  
  
  const params = (await searchParams) ?? {};
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  // section = linkedin | paths
  const section =
    params.section === 'paths' || params.section === 'linkedin'
      ? params.section
      : 'linkedin';

  return (
    <main className="space-y-8">
      <title>Learning</title>

      {/* Top switch */}
      <TabSwitch
        activeKey={section}
        items={[
          {
            key: 'linkedin',
            label: 'LinkedIn Learning',
            href: '/dashboard/learning?section=linkedin',
          },
          {
            key: 'paths',
            label: 'Learning Paths',
            href: '/dashboard/learning?section=paths',
          },
        ]}
      />

      {/* Content */}
      <Suspense fallback={null}>
        {section === 'paths' ? (
          <LearningPathsPage />
        ) : (
          <LinkedInLearningPage searchParams={Promise.resolve(normalizedParams)} />
        )}
      </Suspense>

    </main>
  );
}
