import BookingListTable from '@/app/ui/dashboard/booking-list-table';
import SearchForm from '@/app/ui/dashboard/search-form';

export default async function BookingListPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <SearchForm />
      <BookingListTable />
    </>
  );
}
"use client";
import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react"; // built-in icons

export default function Home() {
  const scrollRef = useRef(null);

  const books = [
    { id: 1, title: "Book 1", author: "anon", cover: "/books/book1.jpg" },
    { id: 2, title: "Book 2", author: "anon", cover: "/books/book2.jpg" },
    { id: 3, title: "Book 3", author: "anon", cover: "/books/book3.jpg" },
    { id: 4, title: "Book 4", author: "anon", cover: "/books/book4.jpg" },
    { id: 5, title: "Book 5", author: "anon", cover: "/books/book5.jpg" },
  ];

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📚 Book Carousel</h1>

      <div className="relative w-full max-w-5xl">
        {/* Left button */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scroll-smooth space-x-6 py-4 px-10 no-scrollbar"
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="min-w-[200px] bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex-shrink-0"
            >
              <div className="w-full h-64 relative mb-3">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <h2 className="font-semibold text-lg">{book.title}</h2>
              <p className="text-gray-500">{book.author}</p>
            </div>
          ))}
        </div>

        {/* Right button */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </main>
  );
}


