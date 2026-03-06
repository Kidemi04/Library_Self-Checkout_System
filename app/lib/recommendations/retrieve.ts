import type { Book } from '@/app/lib/supabase/types';
import { fetchBooks } from '@/app/lib/supabase/queries';

const DEFAULT_LIMIT = 200;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const shouldFallbackToFullCatalog = (books: Book[], requestedTerm: string) =>
  books.length < 20 && requestedTerm.trim().length > 0;

const sanitizeSearchTerm = (value: string) =>
  value
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function retrieveCandidateBooks(
  searchTerm: string,
  limit = DEFAULT_LIMIT,
): Promise<Book[]> {
  const sanitizedLimit = clamp(limit, 20, DEFAULT_LIMIT);

  const sanitizedTerm = sanitizeSearchTerm(searchTerm);
  console.info('[recommendations] search term:', sanitizedTerm || '(empty)');
  const filtered = await fetchBooks(sanitizedTerm || undefined);
  console.info('[recommendations] filtered matches:', filtered.length);
  if (filtered.length >= sanitizedLimit) {
    return filtered.slice(0, sanitizedLimit);
  }

  if (shouldFallbackToFullCatalog(filtered, sanitizedTerm)) {
    const full = await fetchBooks();
    console.info('[recommendations] fallback to full catalog:', full.length);
    return full.slice(0, sanitizedLimit);
  }

  return filtered;
}
