import CreateBookForm from '@/app/ui/dashboard/create-book-form';
import BookCatalogTable from '@/app/ui/dashboard/book-catalog-table';
import SearchForm from '@/app/ui/dashboard/search-form';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { Button } from '@/app/ui/button'

export default async function BookItemsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const raw = params?.q;
  const searchTerm = Array.isArray(raw) ? raw[0]?.trim() ?? '' : raw?.trim() ?? '';
  const books = await fetchBooks(searchTerm);


  return (
    <main className="space-y-8">
      <title>Book Items | Dashboard</title>
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Book Items</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Keep the Supabase-powered catalogue of Swinburne resources up to date.
        </p>
      </header>

      <CreateBookForm />

      <SearchForm
        action="/dashboard/book-items"
        placeholder="Search catalogue by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search books"
      />

      {/* The sort button below search */}
      <div className='flex items-center justify-between gap-2'>

        {/* Availability filter */}
        <select
            aria-label="Filter by availability"
            className="w-56 h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black" >
            <option value="all">All items</option>
            <option value="available">Available</option>
            <option value="onloan">On loan</option>
        </select>


        {/* Sort field */}
        <select
            aria-label="Sort field"
            className="w-56 h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black">
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
          </select>

        {/* Sort order + layout toggle */}
        <select
          aria-label="Sort order"
          className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black">
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>

        {/* View Type */}
        <button 
          type="button"
          className="w-56 h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:block"
          aria-label="Toggle layout"
          title="Toggle layout" >
            Grid View
        </button>

      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60">Showing {books.length} records</p>
        </div>
        <BookCatalogTable books={books} />
      </section>
    </main>
  );
}
