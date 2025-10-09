"use client"
import React, { useMemo, useState } from 'react'
import BookList from '@/app/ui/dashboard/book_list'

type Booking = {
	id: string
	title: string
	author: string
	cover?: string
	description?: string
	tags?: string[]
	available?: boolean
	classification?: string
	isbn?: string
	barcode?: string
	location?: string
}

const SAMPLE_BOOKINGS: Booking[] = [
	{
		id: 'b1',
		title: 'Patterns in Software',
		author: 'A. Engineer',
		cover: 'https://via.placeholder.com/140x200.png?text=Patterns',
		description: 'A collection of reusable solutions and practical patterns for designing maintainable software architectures.',
		tags: ['programming', 'design'],
		available: true,
		classification: 'QA76.76.C672',
		isbn: '978-0-00-0001',
		barcode: 'BC-10001',
		location: 'Main Library – Stack A3',
	},
	{
		id: 'b2',
		title: 'Practical TypeScript',
		author: 'B. Coder',
		cover: 'https://via.placeholder.com/140x200.png?text=TypeScript',
		description: 'Hands-on guide to TypeScript with real-world examples and tips for migrating JavaScript projects.',
		tags: ['typescript', 'programming'],
		available: false,
		classification: 'QA76.73.T98',
		isbn: '978-0-00-0002',
		barcode: 'BC-10002',
		location: 'Annex – Shelf B1',
	},
	{
		id: 'b3',
		title: 'Modern Web UI',
		author: 'C. Designer',
		cover: 'https://via.placeholder.com/140x200.png?text=Web+UI',
		description: 'Principles and patterns for building accessible, responsive and delightful web user interfaces.',
		tags: ['ui', 'accessibility'],
		available: true,
		classification: 'QA76.9',
		isbn: '978-0-00-0003',
		barcode: 'BC-10003',
		location: 'Main Library – Display Shelf',
	},
]

export default function BookingListPage() {
	const [query, setQuery] = useState('')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
	const [sortField, setSortField] = useState<'title' | 'author'>('title')
	const [showFilters, setShowFilters] = useState(false)
	const bookings = useMemo(() => SAMPLE_BOOKINGS, [])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		const base = q
			? bookings.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
			: [...bookings]

		base.sort((a, b) => {
			const A = ((a as any)[sortField] ?? '').toString().toLowerCase()
			const B = ((b as any)[sortField] ?? '').toString().toLowerCase()
			if (A < B) return sortOrder === 'asc' ? -1 : 1
			if (A > B) return sortOrder === 'asc' ? 1 : -1
			return 0
		})

		return base
	}, [bookings, query, sortOrder, sortField])

	return (
		<main className="p-6 bg-gray-50 min-h-screen">
			<div className="max-w-3xl mx-auto">
				<header className="mb-4">
					<h1 className="text-2xl font-semibold text-gray-900">Booking Search</h1>
					<p className="text-sm text-gray-600">Search bookings and view the book list below.</p>
				</header>

				<div className="mb-4">
					<label htmlFor="booking-search" className="sr-only">Search bookings</label>
					<div className="relative flex items-center gap-3">
						<div className="flex-1 relative">
						<input
							id="booking-search"
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search bookings by title or author..."
							className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
						/>
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								className="h-5 w-5 text-gray-400"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
							</svg>
						</div>
						</div>

						<div className="relative">
							<button
								onClick={() => setShowFilters((s) => !s)}
								aria-expanded={showFilters}
								className="inline-flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white text-sm"
							>
								{/* filter icon */}
								<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 14.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-6.586L3.293 6.707A1 1 0 013 6V4z" />
								</svg>
								<span className="text-sm">Filter</span>
							</button>

							{showFilters && (
								<div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20 p-3">
									<div className="text-xs font-semibold text-swin-charcoal mb-2">Sort field</div>
									<div className="flex flex-col gap-1">
										<button
											onClick={() => { setSortField('title'); setShowFilters(false) }}
											className={`text-left text-sm px-2 py-1 rounded ${sortField === 'title' ? 'bg-sky-100' : 'hover:bg-gray-50'}`}
										>
											Title {sortField === 'title' ? '· ✓' : ''}
										</button>
										<button
											onClick={() => { setSortField('author'); setShowFilters(false) }}
											className={`text-left text-sm px-2 py-1 rounded ${sortField === 'author' ? 'bg-sky-100' : 'hover:bg-gray-50'}`}
										>
											Author {sortField === 'author' ? '· ✓' : ''}
										</button>
									</div>

									<div className="mt-3 text-xs font-semibold text-swin-charcoal mb-1">Order</div>
									<div className="flex gap-2">
										<button
											onClick={() => { setSortOrder('asc'); setShowFilters(false) }}
											className={`flex-1 text-sm px-2 py-1 rounded border ${sortOrder === 'asc' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'}`}
										>
											A → Z
										</button>
										<button
											onClick={() => { setSortOrder('desc'); setShowFilters(false) }}
											className={`flex-1 text-sm px-2 py-1 rounded border ${sortOrder === 'desc' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white'}`}
										>
											Z → A
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

						<section>
							<BookList books={filtered} />
						</section>
			</div>
		</main>
	)
}
