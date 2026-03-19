import type { Book } from '@/app/lib/supabase/types';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

const DEFAULT_LIMIT = 200;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const shouldFallbackToFullCatalog = (books: Book[], requestedTerm: string) =>
  books.length < 40 && requestedTerm.trim().length > 0;

const sanitizeSearchTerm = (value: string) =>
  value
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const normalizeToken = (token: string) => token.replace(/^#+/, '').trim().toLowerCase();

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'into',
  'about',
  'that',
  'this',
  'these',
  'those',
  'you',
  'your',
  'book',
  'books',
  'read',
  'reading',
  'recommend',
  'recommendation',
  'recommendations',
]);

const buildTokens = (value: string): string[] => {
  const tokens = tokenizeInterests(value)
    .map(normalizeToken)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
  return unique(tokens);
};

const collectSearchText = (book: Book) =>
  [
    book.title,
    book.author,
    book.classification,
    book.publisher,
    book.isbn,
    (book.tags ?? []).join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const scoreBook = (book: Book, tokens: string[]): number => {
  if (!tokens.length) return 0;
  const title = (book.title ?? '').toLowerCase();
  const author = (book.author ?? '').toLowerCase();
  const tags = (book.tags ?? []).map((tag) => tag.toLowerCase());
  const classification = (book.classification ?? '').toLowerCase();
  const publisher = (book.publisher ?? '').toLowerCase();
  const isbn = (book.isbn ?? '').toLowerCase();
  const corpus = collectSearchText(book);

  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 6;
    if (tags.some((tag) => tag.includes(token))) score += 5;
    if (author.includes(token)) score += 4;
    if (classification.includes(token)) score += 3;
    if (publisher.includes(token)) score += 2;
    if (isbn.includes(token)) score += 2;
    if (corpus.includes(token)) score += 1;
  }
  return score;
};

const mergeById = (books: Book[]): Book[] => {
  const map = new Map<string, Book>();
  for (const book of books) {
    map.set(book.id, book);
  }
  return Array.from(map.values());
};

export async function retrieveCandidateBooks(
  searchTerm: string,
  limit = DEFAULT_LIMIT,
): Promise<Book[]> {
  const sanitizedLimit = clamp(limit, 20, DEFAULT_LIMIT);

  const sanitizedTerm = sanitizeSearchTerm(searchTerm);
  const tokens = buildTokens(sanitizedTerm);
  const primaryToken = tokens.sort((a, b) => b.length - a.length)[0];

  console.info('[recommendations] rag tokens:', tokens.length ? tokens.join(', ') : '(none)');
  const filtered = primaryToken ? await fetchBooks(primaryToken) : await fetchBooks();
  console.info('[recommendations] initial matches:', filtered.length);

  let candidates = filtered;
  if (shouldFallbackToFullCatalog(filtered, sanitizedTerm)) {
    const full = await fetchBooks();
    console.info('[recommendations] fallback to full catalog:', full.length);
    candidates = mergeById([...filtered, ...full]);
  }

  if (!tokens.length) {
    return candidates.slice(0, sanitizedLimit);
  }

  const scored = candidates
    .map((book) => ({ book, score: scoreBook(book, tokens) }))
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.book.title.localeCompare(b.book.title);
      }
      return b.score - a.score;
    });

  const filteredScored = scored.filter((entry) => entry.score > 0);
  const finalList = filteredScored.length ? filteredScored : scored;

  return finalList.slice(0, sanitizedLimit).map((entry) => entry.book);
}
