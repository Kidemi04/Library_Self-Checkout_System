// app/dashboard/book/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import TabSwitch from '@/app/ui/dashboard/tab-switch';

// Sub pages (keep filenames unchanged)
import BookItemsPage from './book-items/page';
import ReturningBooksPage from './check-in/page';
import BorrowBooksPage from './check-out/page';

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = (await searchParams) ?? {};
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  // Normalize params (remove undefined)
  const params: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(rawParams).filter(([, value]) => value !== undefined),
  ) as Record<string, string | string[]>;

  /**
   * section controls which book module is shown
   * - items     -> catalogue
   * - checkout  -> borrow books
   * - checkin   -> return books
   */
  const section =
    params.section === 'checkout' || params.section === 'checkin' || params.section === 'items'
      ? params.section
      : 'items';

  return (
    <main className="space-y-8">

      {/* Top navigation */}
      <TabSwitch
        activeKey={section}
        items={[
          {
            key: 'items',
            label: 'Book Items',
            href: '/dashboard/book?section=items',
          },
          {
            key: 'checkout',
            label: 'Borrow Books',
            href: '/dashboard/book?section=checkout',
          },
          {
            key: 'checkin',
            label: 'Return Books',
            href: '/dashboard/book?section=checkin',
          },
        ]}
      />

      {/* Content */}
      <Suspense fallback={null}>
        {section === 'checkout' ? (
          <BorrowBooksPage searchParams={Promise.resolve(params)} />
        ) : section === 'checkin' ? (
          <ReturningBooksPage searchParams={Promise.resolve(params)} />
        ) : (
          <BookItemsPage searchParams={Promise.resolve(params)} />
        )}
      </Suspense>
    </main>
  );
}
