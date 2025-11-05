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
		<div className="rounded-2xl border border-swin-charcoal/10 bg-white shadow-sm shadow-swin-charcoal/5">
			<div className="p-4">
				<h2 className="text-lg font-semibold text-swin-charcoal">Books</h2>
			</div>

			<div className="divide-y divide-swin-charcoal/10 bg-white">
				{items.length === 0 ? (
					<div className="p-6 text-sm text-swin-charcoal/60">No books to display.</div>
				) : (
					items.map((b) => (
						<div
							key={b.id}
							className="flex flex-col sm:flex-row gap-4 px-6 py-4 items-start hover:bg-swin-ivory transition"
						>
							{/* 封面图片 */}
							<img
								src={b.cover ?? '/a.txt'}
								alt={`Cover of ${b.title}`}
								className="h-48 w-full sm:h-40 sm:w-28 flex-none rounded object-cover border border-gray-100"
							/>

							{/* 详情区域 */}
							<div className="flex-1 w-full">
								<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
									<div>
										<div className="font-medium text-swin-charcoal">{b.title}</div>
										<div className="text-xs text-swin-charcoal/60">{b.author}</div>
									</div>
									<div className="mt-2 sm:mt-0 text-sm text-swin-charcoal/60">
										{b.available ? (
											<span className="inline-flex items-center rounded-full bg-swin-charcoal/10 px-3 py-1 text-xs font-semibold text-swin-charcoal">
												Available
											</span>
										) : (
											<span className="inline-flex items-center rounded-full bg-swin-red/10 px-3 py-1 text-xs font-semibold text-swin-red">
												Checked out
											</span>
										)}
									</div>
								</div>

								<p className="mt-2 text-sm text-swin-charcoal/60">
									{b.description ?? 'No description available.'}
								</p>

								<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-swin-charcoal/60">
									<div>
										<div className="font-semibold text-swin-charcoal/80 text-xs">Classification</div>
										<div className="text-xs">{b.classification ?? 'QA76.76.C672'}</div>
									</div>

									<div>
										<div className="font-semibold text-swin-charcoal/80 text-xs">ISBN</div>
										<div className="text-xs">{b.isbn ?? '978-0-00-0000'}</div>
									</div>

									<div>
										<div className="font-semibold text-swin-charcoal/80 text-xs">Barcode</div>
										<div className="text-xs">{b.barcode ?? 'Internal barcode'}</div>
									</div>

								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									{(b.tags || []).map((t) => (
										<span
											key={t}
											className="text-[11px] bg-gray-100 px-2 py-1 rounded"
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
