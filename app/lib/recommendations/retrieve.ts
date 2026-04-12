import type { Book } from '@/app/lib/supabase/types';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

const DEFAULT_LIMIT = 200;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sanitizeSearchTerm = (value: string) =>
  value
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

const normalizeToken = (token: string) =>
  token.toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9\-]/g, '').trim();

const STOPWORDS = new Set([
  'the', 'and', 'but', 'for', 'with', 'from', 'into', 'about', 'that',
  'this', 'these', 'those', 'than', 'then', 'only', 'just', 'very',
  'you', 'your', 'our', 'his', 'her', 'its', 'they', 'them', 'their',
  'can', 'could', 'would', 'should', 'will', 'shall', 'may', 'might',
  'want', 'like', 'need', 'know', 'think', 'look', 'find', 'use',
  'get', 'got', 'give', 'take', 'make', 'see', 'come', 'say', 'let',
  'share', 'show', 'tell', 'help', 'ask',
  'book', 'books', 'read', 'reading',
  'recommend', 'recommendation', 'recommendations', 'suggest', 'suggestions',
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

// Derive the expected study year from intake year (1-4, clamped)
const getStudyYear = (intakeYear: number | null): number | null => {
  if (!intakeYear) return null;
  const year = new Date().getFullYear() - intakeYear + 1;
  return Math.min(Math.max(year, 1), 4);
};

// Map study year to expected book level
const studyYearToLevel = (studyYear: number): number => {
  if (studyYear <= 1) return 1;
  if (studyYear <= 2) return 2;
  return 3;
};

const scoreBook = (
  book: Book,
  tokens: string[],
  preferredCategory: string | null,
  studyYear: number | null,
): number => {
  if (!tokens.length) return 0;

  const title = (book.title ?? '').toLowerCase();
  const author = (book.author ?? '').toLowerCase();
  const tags = (book.tags ?? []).map((tag) => tag.toLowerCase());
  const classification = (book.classification ?? '').toLowerCase();
  const publisher = (book.publisher ?? '').toLowerCase();
  const isbn = (book.isbn ?? '').toLowerCase();
  const corpus = collectSearchText(book);

  let score = 0;

  // Token matching
  for (const token of tokens) {
    if (title.includes(token)) score += 6;
    if (tags.some((tag) => tag.includes(token))) score += 5;
    if (author.includes(token)) score += 4;
    if (classification.includes(token)) score += 3;
    if (publisher.includes(token)) score += 2;
    if (isbn.includes(token)) score += 2;
    if (corpus.includes(token)) score += 1;
  }

  // Faculty/category bonus — books matching the student's faculty get priority
  if (preferredCategory && book.category === preferredCategory) {
    score += 3;
  }

  // Level bonus — books matching the student's study year level get priority
  if (studyYear && book.level) {
    const expectedLevel = studyYearToLevel(studyYear);
    if (book.level === expectedLevel) score += 2;
    else if (Math.abs(book.level - expectedLevel) === 1) score += 1; // adjacent level is ok
  }

  return score;
};

export async function retrieveCandidateBooks(
  searchTerm: string,
  limit = DEFAULT_LIMIT,
  preferredCategory: string | null = null,
  intakeYear: number | null = null,
): Promise<Book[]> {
  const sanitizedLimit = clamp(limit, 20, DEFAULT_LIMIT);
  const sanitizedTerm = sanitizeSearchTerm(searchTerm);
  const tokens = buildTokens(sanitizedTerm);
  const studyYear = getStudyYear(intakeYear);

  const allBooks = await fetchBooks();
  console.info(
    '[recommendations] catalog size:', allBooks.length,
    '| tokens:', tokens.length ? tokens.join(', ') : '(none)',
    '| category:', preferredCategory ?? 'any',
    '| study year:', studyYear ?? 'unknown',
  );

  if (!tokens.length) {
    return allBooks.slice(0, sanitizedLimit);
  }

  const scored = allBooks
    .map((book) => ({ book, score: scoreBook(book, tokens, preferredCategory, studyYear) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.book.title.localeCompare(b.book.title);
    });

  const filtered = scored.filter((e) => e.score > 0);
  const finalList = filtered.length ? filtered : scored;

  return finalList.slice(0, sanitizedLimit).map((e) => e.book);
}
