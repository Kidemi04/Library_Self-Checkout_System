"use client"

import React from 'react'

type Book = {
	id: string
	title: string
	author: string
	isbn?: string
	available?: boolean
	tags?: string[]
	cover?: string
	description?: string
	classification?: string
	barcode?: string
}

export default function BookList({ books }: { books?: Book[] }) {
	const items = books && books.length > 0 ? books : []

	return (
		<div className="rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card">
			<div className="p-4">
				<h2 className="font-display text-display-md text-ink dark:text-on-dark">Books</h2>
			</div>

			<div className="divide-y divide-hairline-soft bg-surface-card dark:divide-dark-hairline dark:bg-dark-surface-card">
				{items.length === 0 ? (
					<div className="p-6 font-sans text-body-md text-muted dark:text-on-dark-soft">No books to display.</div>
				) : (
					items.map((b) => (
						<div
							key={b.id}
							className="flex flex-col sm:flex-row gap-4 p-5 items-start hover:bg-surface-cream-strong dark:hover:bg-dark-surface-strong transition"
						>
							{/* Cover Page */}
							<img
								src={b.cover ?? ''}
								alt={`Cover of ${b.title}`}
								className="h-48 w-full sm:h-40 sm:w-28 flex-none rounded object-cover border border-hairline dark:border-dark-hairline"
							/>

							{/* Details Area */}
							<div className="flex-1 w-full">
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
									<div>
										<div className="font-sans text-title-md text-ink dark:text-on-dark">{b.title}</div>
										<div className="font-sans text-body-sm text-muted dark:text-on-dark-soft">{b.author}</div>
									</div>
									<div className="mt-2 sm:mt-0">
										{b.available ? (
											<span className="inline-flex items-center rounded-pill bg-surface-cream-strong px-3 py-1 font-sans text-caption font-semibold text-ink dark:bg-dark-surface-strong dark:text-on-dark">
												Available
											</span>
										) : (
											<span className="inline-flex items-center rounded-pill bg-primary/10 px-3 py-1 font-sans text-caption font-semibold text-primary dark:bg-dark-primary/15 dark:text-dark-primary">
												Checked out
											</span>
										)}
									</div>
								</div>

								<p className="mt-2 font-sans text-body-sm text-body dark:text-on-dark/70">
									{b.description ?? 'No description available.'}
								</p>

								<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
									<div>
										<div className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">Classification</div>
										<div className="font-mono text-code text-muted dark:text-on-dark-soft">{b.classification ?? 'QA76.76.C672'}</div>
									</div>

									<div>
										<div className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">ISBN</div>
										<div className="font-mono text-code text-muted dark:text-on-dark-soft">{b.isbn ?? '978-0-00-0000'}</div>
									</div>

									<div>
										<div className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">Barcode</div>
										<div className="font-mono text-code text-muted dark:text-on-dark-soft">{b.barcode ?? 'Internal barcode'}</div>
									</div>

								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									{(b.tags || []).map((t) => (
										<span
											key={t}
											className="font-sans text-caption bg-surface-cream-strong text-muted dark:bg-dark-surface-strong dark:text-on-dark-soft px-2 py-1 rounded-pill"
										>
											{t}
										</span>
									))}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	)
}
