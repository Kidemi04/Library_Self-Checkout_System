import { createClient } from '@supabase/supabase-js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.');
}
if (!SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_LIMIT = 200;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sanitizeSearchTerm = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const escapeForIlike = (value) =>
  value.replace(/[%_]/g, (match) => `\\${match}`).replace(/'/g, "''");

const normalizeCopyStatus = (value) => {
  if (typeof value !== 'string') return 'available';
  switch (value.trim().toUpperCase()) {
    case 'ON_LOAN':
      return 'on_loan';
    case 'LOST':
      return 'lost';
    case 'DAMAGED':
      return 'damaged';
    case 'PROCESSING':
      return 'processing';
    case 'HOLD_SHELF':
      return 'hold_shelf';
    case 'AVAILABLE':
    default:
      return 'available';
  }
};

const isCopyAvailable = (copy) => {
  if (!copy) return false;
  if (copy.status !== 'available') return false;
  return !(copy.loans ?? []).some((loan) => loan.returnedAt == null);
};

const mapCopyRow = (row) => ({
  id: row.id,
  bookId: row.book_id,
  barcode: row.barcode,
  status: normalizeCopyStatus(row.status),
  loans: (row.loans ?? []).map((loan) => ({
    id: loan.id,
    returnedAt: loan.returned_at ?? null,
  })),
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

const mapBookRow = (row) => {
  const copies = (row.copies ?? []).map(mapCopyRow);
  const availableCopies = copies.filter(isCopyAvailable).length;
  const tags = (row.book_tag_links ?? [])
    .map((link) => link?.tag?.name)
    .filter((name) => typeof name === 'string' && name.length > 0);

  return {
    id: row.id,
    title: row.title,
    author: row.author ?? null,
    isbn: row.isbn ?? null,
    classification: row.classification ?? null,
    coverImageUrl: row.cover_image_url ?? null,
    publisher: row.publisher ?? null,
    publicationYear: row.publication_year ?? null,
    tags,
    copies,
    totalCopies: copies.length,
    availableCopies,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
};

const fetchBooks = async (searchTerm, limit = DEFAULT_LIMIT) => {
  const sanitized = sanitizeSearchTerm(searchTerm);
  const sanitizedLimit = clamp(limit, 20, DEFAULT_LIMIT);

  let query = supabase
    .from('books')
    .select(
      `
        id,
        title,
        author,
        isbn,
        classification,
        publisher,
        publication_year,
        cover_image_url,
        created_at,
        updated_at,
        copies:copies(
          id,
          book_id,
          barcode,
          status,
          created_at,
          updated_at,
          loans:loans(
            id,
            returned_at
          )
        ),
        book_tag_links:book_tag_links(
          tag:book_tags(
            name
          )
        )
      `,
    )
    .order('title')
    .limit(sanitizedLimit);

  if (sanitized) {
    const pattern = `%${escapeForIlike(sanitized)}%`;
    query = query.or(
      [
        `title.ilike.${pattern}`,
        `author.ilike.${pattern}`,
        `isbn.ilike.${pattern}`,
        `classification.ilike.${pattern}`,
        `publisher.ilike.${pattern}`,
      ].join(','),
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  const mapped = (data ?? []).map(mapBookRow);

  if (!sanitized) {
    return mapped;
  }

  const lowered = sanitized.toLowerCase();

  return mapped.filter((book) => {
    const matchesBook =
      (book.title?.toLowerCase().includes(lowered) ?? false) ||
      (book.author?.toLowerCase().includes(lowered) ?? false) ||
      (book.isbn?.toLowerCase().includes(lowered) ?? false) ||
      (book.classification?.toLowerCase().includes(lowered) ?? false) ||
      (book.publisher?.toLowerCase().includes(lowered) ?? false);

    if (matchesBook) return true;

    return book.copies.some((copy) => copy.barcode.toLowerCase().includes(lowered));
  });
};

const server = new McpServer({
  name: 'library-supabase',
  version: '1.0.0',
});

server.tool(
  'search_books',
  {
    query: z.string().optional(),
    limit: z.number().int().min(1).max(DEFAULT_LIMIT).optional(),
  },
  async ({ query, limit }) => {
    const books = await fetchBooks(query ?? '', limit ?? DEFAULT_LIMIT);
    return {
      content: [{ type: 'text', text: JSON.stringify({ books }) }],
    };
  },
);

const transport = new StdioServerTransport();

async function main() {
  await server.connect(transport);
  console.error('[mcp] library-supabase server running on stdio');
}

main().catch((error) => {
  console.error('[mcp] server failed', error);
  process.exit(1);
});
