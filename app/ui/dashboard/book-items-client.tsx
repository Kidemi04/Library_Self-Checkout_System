'use client';

import { useState, useEffect } from 'react';
import BookCatalogTable from '@/app/ui/dashboard/book-catalog-table';
import { fetchBooks } from '@/app/lib/supabase/queries';
import SearchForm from '@/app/ui/dashboard/search-form';

export default function BookItemsClient({ initialBooks, initialSearchTerm }: {
  initialBooks: any[];
  initialSearchTerm: string;
}) {
  const [books, setBooks] = useState(initialBooks);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [availability, setAvailability] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewType, setViewType] = useState<'grid' | 'table'>('table');

  // Reload books whenever filter/sort/search changes
  useEffect(() => {
    async function loadBooks() {
      const data = await fetchBooks(searchTerm, { availability, sortField, sortOrder });
      setBooks(data);
    }
    loadBooks();
  }, [searchTerm, availability, sortField, sortOrder]);

  return (
    <div className="space-y-6">

      {/* The sort button below search */}
      <SearchForm
        action="/dashboard/book-items"
        placeholder="Search catalogue by title, author, ISBN, or barcode"
        defaultValue={searchTerm}
        aria-label="Search books"
      />

      {/* Filter + Sort */}
      <div className="flex items-center justify-between gap-2">

        {/* Availability filter */}
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          aria-label="Filter by availability"
          className="w-56 h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
        >
          <option value="all">All items</option>
          <option value="available">Available</option>
          <option value="onloan">On loan</option>
        </select>

        {/* Sort title and author */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          aria-label="Sort field"
          className="w-56 h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
        >
          <option value="title">Sort: Title</option>
          <option value="author">Sort: Author</option>
        </select>

        {/* Sort ascending and descending */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          aria-label="Sort order"
          className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
        >
          <option value="asc">A → Z</option>
          <option value="desc">Z → A</option>
        </select>

        {/* View Type, Grid view and Table view */}
        <button
          type="button"
          onClick={() => setViewType(viewType === 'table' ? 'grid' : 'table')}
          className="w-56 h-12 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:block"
          aria-label="Toggle layout"
          title="Toggle layout"
        >
          {viewType === 'table' ? 'Grid View' : 'Table View'}
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Catalogue</h2>
          <p className="text-sm text-swin-charcoal/60">Showing {books.length} records</p>
        </div>

        <BookCatalogTable books={books} viewType={viewType} />
      </section>
    </div>
  );
}
