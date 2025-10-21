"use client"
import React, { useMemo, useState, useEffect } from 'react'
import BookList from '@/app/ui/dashboard/book-list'
import BookListMobile from '@/app/ui/dashboard/book-list-mobile'

type UIBook = {
  id: string;
  title: string;
  author: string;
  cover?: string;
  tags?: string[];
  available?: boolean;
  classification?: string | null;
  isbn?: string | null;
  barcode?: string | null;
  location?: string | null;
};

// ---- Temporary sample data (replace with real data later) ----
const SAMPLE_BOOKS: UIBook[] = [
  {
    id: "b1",
    title: "Patterns in Software",
    author: "A. Engineer",
    cover: "https://via.placeholder.com/140x200.png?text=Patterns",
    tags: ["programming", "design"],
    available: true,
    classification: "QA76.76.C672",
    isbn: "978-0-00-0001",
    barcode: "BC-10001",
    location: "Main Library – Stack A3",
  },
  {
    id: "b2",
    title: "Practical TypeScript",
    author: "B. Coder",
    cover: "https://via.placeholder.com/140x200.png?text=TypeScript",
    tags: ["typescript", "programming"],
    available: false,
    classification: "QA76.73.T98",
    isbn: "978-0-00-0002",
    barcode: "BC-10002",
    location: "Annex – Shelf B1",
  },
  {
    id: "b3",
    title: "Modern Web UI",
    author: "C. Designer",
    cover: "https://via.placeholder.com/140x200.png?text=Web+UI",
    tags: ["ui", "accessibility"],
    available: true,
    classification: "QA76.9",
    isbn: "978-0-00-0003",
    barcode: "BC-10003",
    location: "Main Library – Display Shelf",
  },
];

type SortField = "title" | "author";
type SortOrder = "asc" | "desc";
type Availability = "all" | "available" | "onloan";

export default function BookListPage() {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [availability, setAvailability] = useState<Availability>("all");
  const [variant, setVariant] = useState<"grid" | "list">("grid");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const books = useMemo(() => SAMPLE_BOOKS, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let base = q
      ? books.filter(
          (b) =>
            (b.title ?? "").toLowerCase().includes(q) ||
            (b.author ?? "").toLowerCase().includes(q)
        )
      : [...books];

    if (availability !== "all") {
      base = base.filter((b) =>
        availability === "available" ? b.available === true : b.available === false
      );
    }

    base.sort((a, b) => {
      const A = String((a as any)[sortField] ?? "").toLowerCase();
      const B = String((b as any)[sortField] ?? "").toLowerCase();
      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return base;
  }, [books, query, sortField, sortOrder, availability]);

  return (
    <main className="space-y-8 p-6 bg-transparent-50 min-h-screen">
      <title>Dashboard | Book List</title>

      {/* Header bar */}
      <header className="rounded-2xl bg-swin-charcoal p-8 text-swin-ivory shadow-lg shadow-swin-charcoal/30">
        <h1 className="text-2xl font-semibold">Catalogue</h1>
        <p className="mt-2 max-w-2xl text-sm text-swin-ivory/70">
          Browse the library collection. Use title or author to narrow results.
          {filtered.length ? ` Showing ${filtered.length} item(s).` : ""}
        </p>
      </header>

      {/* Toolbar */}
      <section className="mx-auto max-w-5xl">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author"
            aria-label="Search by title or author"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black placeholder-gray-500"
          />

          {/* Availability filter */}
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as Availability)}
            aria-label="Filter by availability"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
          >
            <option value="all">All items</option>
            <option value="available">Available</option>
            <option value="onloan">On loan</option>
          </select>

          {/* Sort field */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            aria-label="Sort field"
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
          >
            <option value="title">Sort: Title</option>
            <option value="author">Sort: Author</option>
          </select>

          {/* Sort order + layout toggle */}
          <div className="flex items-center justify-between gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              aria-label="Sort order"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-swin-red/60 text-black"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>

            <button
              type="button"
              onClick={() => setVariant(variant === "grid" ? "list" : "grid")}
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:block"
              aria-label="Toggle layout"
              title="Toggle layout"
            >
              {variant === "grid" ? "List view" : "Grid view"}
            </button>
          </div>
        </div>

        {/* List */}
        <BookList books={filtered} variant={variant} />
      </section>
    </main>
  );
}
