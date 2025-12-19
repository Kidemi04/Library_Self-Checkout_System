// app/dashboard/book/page.tsx
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import TabSwitch from '@/app/ui/dashboard/tab-switch';

// Sub pages
import BookItemsPage from './book-items/page';
import BorrowBooksPage from './check-out/page';
import ReturningBooksPage from './check-in/page';
import BookListPage from './book-list/page';

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = (await searchParams) ?? {};
  const { user } = await getDashboardSession();
  if (!user) redirect('/login');

  const isPrivileged = user.role === 'staff' || user.role === 'admin';

  // Normalize params (remove undefined)
  const params: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(rawParams).filter(([, value]) => value !== undefined),
  ) as Record<string, string | string[]>;

  /**
   * section controls which module is shown
   * items     -> public catalogue
   * checkout  -> borrow
   * checkin   -> return
   * list      -> admin catalogue (privileged only)
   */
  const allowedSections = isPrivileged
    ? ['items', 'checkout', 'checkin', 'list']
    : ['items', 'checkout', 'checkin'];

  const section = allowedSections.includes(params.section as string)
    ? (params.section as string)
    : 'items';

  // If user manually types ?section=list without permission
  if (section === 'list' && !isPrivileged) {
    redirect('/dashboard/book?section=items');
  }

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
          ...(isPrivileged
            ? [
                {
                  key: 'list',
                  label: 'Book List',
                  href: '/dashboard/book?section=list',
                },
              ]
            : []),
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
        ) : section === 'list' && isPrivileged ? (
          <BookListPage searchParams={Promise.resolve(params)} />
        ) : (
          <BookItemsPage searchParams={Promise.resolve(params)} />
        )}
      </Suspense>
    </main>
  );
}
