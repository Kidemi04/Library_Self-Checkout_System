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

// Strip # prefix, punctuation, lowercase — handles "science?" → "science"
const normalizeToken = (token: string) =>
  token.toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9\-]/g, '').trim();

const STOPWORDS = new Set([
  // articles / conjunctions / prepositions
  'the', 'and', 'but', 'for', 'with', 'from', 'into', 'about', 'that',
  'this', 'these', 'those', 'than', 'then', 'only', 'just', 'very',
  // pronouns
  'you', 'your', 'our', 'his', 'her', 'its', 'they', 'them', 'their',
  // common verbs with no topic signal
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might',
  'want', 'like', 'need', 'know', 'think', 'look', 'find', 'use',
  'get', 'got', 'give', 'take', 'make', 'see', 'come', 'say', 'let',
  'share', 'show', 'tell', 'help', 'ask',
  // library-specific noise
  'book', 'books', 'read', 'reading',
  'recommend', 'recommendation', 'recommendations', 'suggest', 'suggestions',
  // misc / filler
  'some', 'more', 'most', 'each', 'every', 'please', 'thanks', 'learn', 'learning',
  'me', 'yo', 'hi', 'hey', 'something', 'anything', 'everything', 'nothing',
  'sure', 'okay',
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

  // Always fetch full catalog so books matched only by hashtags are included.
  // SQL pre-filter searches title/author/isbn only and misses tag-only matches.
  const allBooks = await fetchBooks();
  console.info(
    '[recommendations] catalog size:', allBooks.length,
    '| tokens:', tokens.length ? tokens.join(', ') : '(none)',
  );
  const candidates = allBooks;

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
