"use client"
import React, { useMemo, useState, useEffect } from 'react'
import BookList from '@/app/ui/dashboard/book-list'
import BookListMobile from '@/app/ui/dashboard/book-list-mobile'

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
	const [isMobile, setIsMobile] = useState(false)

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 640)
		handleResize()
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

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
			<title>Dashboard | Book List</title>
			<div className="max-w-3xl mx-auto">

				<section>
					{isMobile ? (
						<BookListMobile books={filtered} />
					) : (
						<BookList books={filtered} />
					)}
				</section>
			</div>
		</main>
	)
}