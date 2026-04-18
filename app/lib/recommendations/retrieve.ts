import type { Book } from '@/app/lib/supabase/types';
import { fetchBooks } from '@/app/lib/supabase/queries';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { embed } from '@/app/lib/recommendations/embeddings';

const DEFAULT_LIMIT = 200;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const studyYearFromIntake = (intakeYear: number | null): number | null => {
  if (!intakeYear) return null;
  const year = new Date().getFullYear() - intakeYear + 1;
  return Math.min(Math.max(year, 1), 4);
};

const studyYearToLevel = (studyYear: number): number => {
  if (studyYear <= 1) return 1;
  if (studyYear <= 2) return 2;
  return 3;
};

// Re-rank vector matches with category/level bonuses so faculty-aligned books bubble up.
const applyContextBoost = (
  base: { book: Book; score: number }[],
  preferredCategory: string | null,
  studyYear: number | null,
): { book: Book; score: number }[] => {
  return base
    .map(({ book, score }) => {
      let boosted = score;
      if (preferredCategory && book.category === preferredCategory) {
        boosted += 0.05;
      }
      if (studyYear && book.level) {
        const expected = studyYearToLevel(studyYear);
        if (book.level === expected) boosted += 0.03;
        else if (Math.abs(book.level - expected) === 1) boosted += 0.015;
      }
      return { book, score: boosted };
    })
    .sort((a, b) => b.score - a.score);
};

export async function retrieveCandidateBooks(
  searchTerm: string,
  limit = DEFAULT_LIMIT,
  preferredCategory: string | null = null,
  intakeYear: number | null = null,
): Promise<Book[]> {
  const sanitizedLimit = clamp(limit, 20, DEFAULT_LIMIT);
  const trimmed = searchTerm.trim();
  const studyYear = studyYearFromIntake(intakeYear);

  const allBooks = await fetchBooks();

  if (!trimmed) {
    return allBooks.slice(0, sanitizedLimit);
  }

  const supabase = getSupabaseServerClient();

  let scoredIds: { id: string; score: number }[] = [];
  try {
    const queryVector = await embed(trimmed);

    const { data, error } = await supabase.rpc('match_books', {
      query_embedding: queryVector,
      match_count: sanitizedLimit,
    });

    if (error) {
      console.error('[recommendations] vector search failed', error);
    } else {
      scoredIds = ((data ?? []) as Array<{ id: string; score: number }>).map((row) => ({
        id: row.id,
        score: row.score ?? 0,
      }));
    }
  } catch (err) {
    console.error('[recommendations] embedding failed', err);
  }

  console.info(
    '[recommendations] catalog size:', allBooks.length,
    '| query:', trimmed,
    '| vector matches:', scoredIds.length,
    '| category:', preferredCategory ?? 'any',
    '| study year:', studyYear ?? 'unknown',
  );

  // No vector hits (e.g. no embeddings yet) → return whole catalog as fallback so caller can still rank/show.
  if (!scoredIds.length) {
    return allBooks.slice(0, sanitizedLimit);
  }

  const bookById = new Map(allBooks.map((b) => [b.id, b]));
  const matched = scoredIds
    .map(({ id, score }) => {
      const book = bookById.get(id);
      return book ? { book, score } : null;
    })
    .filter((entry): entry is { book: Book; score: number } => entry !== null);

  const reranked = applyContextBoost(matched, preferredCategory, studyYear);

  return reranked.slice(0, sanitizedLimit).map((e) => e.book);
}
