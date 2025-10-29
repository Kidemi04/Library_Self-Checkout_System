import CreateBookForm from '@/app/ui/dashboard/create-book-form';
import BookItemsClient from '@/app/ui/dashboard/book-items-client';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { getDashboardSession } from '@/app/lib/auth/session'; 
import type { DashboardRole } from '@/app/lib/auth/types';

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';
  const books = await fetchBooks(searchTerm);

  const session = await getDashboardSession();
  const role: DashboardRole = session?.user?.role ?? 'student';

  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>
      <header className="rounded-2xl border border-swin-ivory/10 bg-swin-charcoal p-8 text-swin-ivory shadow-inner shadow-black/20">
        <h1 className="text-2xl font-semibold text-swin-ivory">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Keep the Supabase-powered catalogue of Swinburne resources up to date.
        </p>
      </header>

      {/* Create a new book */}
      {role === 'staff' && <CreateBookForm />}

      {/* Search Book */}
      <BookItemsClient initialBooks={books} initialSearchTerm={searchTerm} role={role} />

    </main>
  );
}