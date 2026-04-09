import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

export type UserContext = {
  historyTags: string[];
  savedInterests: string[];
};

type RawLoanHistoryRow = {
  copy: {
    book: {
      book_tag_links: Array<{ tag: { name: string | null } | null }> | null;
    } | null;
  } | null;
};

type RawUserInterestsRow = {
  interests: string[] | string | null;
};

const INTEREST_TABLE_NAMES = [
  'user_interests',
  'UserInterest',
  'UserInterests',
  'userinterest',
];

const isTableNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const message =
    'message' in error && typeof (error as any).message === 'string'
      ? (error as any).message
      : '';
  const code = 'code' in error ? String((error as any).code) : '';
  return (
    /does not exist/i.test(message) ||
    /relation .* does not exist/i.test(message) ||
    code === 'PGRST116' ||
    code === '42P01'
  );
};

const tryInterestTableQuery = async <T extends { data: any; error: any }>(
  supabase: SupabaseClient,
  callback: (table: string) => PromiseLike<T> | T,
): Promise<T> => {
  let lastResult: T | null = null;

  for (const table of INTEREST_TABLE_NAMES) {
    const result = await callback(table);
    if (!result.error) {
      return result;
    }

    lastResult = result;
    if (!isTableNotFoundError(result.error)) {
      return result;
    }
  }

  return lastResult as T;
};

const resolveInterestTableName = async (supabase: SupabaseClient): Promise<string> => {
  for (const tableName of INTEREST_TABLE_NAMES) {
    const { error } = await supabase.from(tableName).select('user_id').limit(1);
    if (!error) {
      return tableName;
    }

    if (!isTableNotFoundError(error)) {
      throw error;
    }
  }

  return 'user_interests';
};

/**
 * Fetches the user's loan history tags (from borrowed books' BookTags) and
 * their saved interests from the interest table. Both DB calls run in parallel.
 */
export async function fetchUserContext(userId: string): Promise<UserContext> {
  if (!userId) return { historyTags: [], savedInterests: [] };

  const supabase = getSupabaseServerClient();

  const [loansResult, interestsResult] = await Promise.all([
    supabase
      .from('Loans')
      .select(
        `
          copy:Copies(
            book:Books(
              book_tag_links:BookTagsLinks(
                tag:BookTags(name)
              )
            )
          )
        `,
      )
      .eq('user_id', userId)
      .order('borrowed_at', { ascending: false })
      .limit(20),

    tryInterestTableQuery(supabase, (table) =>
      supabase
        .from(table)
        .select('interests')
        .eq('user_id', userId)
        .maybeSingle<RawUserInterestsRow>(),
    ),
  ]);

  // Extract and deduplicate history tags
  const historyTags: string[] = [];
  const tagSeen = new Set<string>();

  if (!loansResult.error && loansResult.data) {
    const rows = loansResult.data as unknown as RawLoanHistoryRow[];
    for (const row of rows) {
      const links = row.copy?.book?.book_tag_links ?? [];
      for (const link of links) {
        const name = link?.tag?.name;
        if (typeof name === 'string' && name.trim().length > 0) {
          const normalized = name.trim().toLowerCase();
          if (!tagSeen.has(normalized)) {
            tagSeen.add(normalized);
            historyTags.push(normalized);
          }
        }
      }
    }
  }

  // Extract saved interests
  const savedInterests: string[] = [];
  if (!interestsResult.error && interestsResult.data?.interests) {
    const raw = interestsResult.data.interests;
    const values = Array.isArray(raw) ? raw : [raw];
    savedInterests.push(
      ...values
        .map((v) => String(v).trim().toLowerCase())
        .filter((v) => v.length > 0),
    );
  }

  return { historyTags, savedInterests };
}

/**
 * Saves (upserts) the user's interests into the configured interest table.
 */
export async function saveUserInterests(
  userId: string,
  interests: string[],
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const sanitized = interests
    .map((v) => String(v).trim().toLowerCase())
    .filter((v) => v.length > 0 && v.length <= 60)
    .slice(0, 30);

  const tableName = await resolveInterestTableName(supabase);
  const interestsPayload = sanitized;

  let { error } = await supabase
    .from(tableName)
    .upsert(
      { user_id: userId, interests: interestsPayload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) {
    const message = String(error.message ?? '');
    const code = String(error.code ?? '');
    
    // If table not found, provide helpful error message
    if (code === 'PGRST205' || /does not exist|could not find the table/.test(message)) {
      const helpMsg = 'user_interests table not found. Please run the migration in Supabase SQL Editor. See SUPABASE_SETUP_REQUIRED.md for instructions.';
      throw new Error(helpMsg);
    }
    
    // If type mismatch, retry with text fallback
    if (/invalid input syntax for type text|cannot cast|column .* is of type text/.test(message)) {
      const fallbackPayload = sanitized[0] ?? '';
      const fallbackResult = await supabase
        .from(tableName)
        .upsert(
          { user_id: userId, interests: fallbackPayload, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
      if (fallbackResult.error) throw fallbackResult.error;
      return;
    }

    throw error;
  }
}

/**
 * Returns true if the user has at least one saved interest OR any loan history.
 * Used by the chat page to decide whether to show the onboarding tag selector.
 */
export async function userNeedsOnboarding(userId: string): Promise<boolean> {
  if (!userId) return true;

  const supabase = getSupabaseServerClient();

  const [interestsResult, loansResult] = await Promise.all([
    tryInterestTableQuery(supabase, (table) =>
      supabase
        .from(table)
        .select('interests')
        .eq('user_id', userId)
        .maybeSingle<RawUserInterestsRow>(),
    ),

    supabase
      .from('Loans')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .limit(1),
  ]);

  const savedInterestValue = interestsResult.data?.interests;
  const hasSavedInterests =
    !interestsResult.error &&
    ((Array.isArray(savedInterestValue) && (savedInterestValue.length ?? 0) > 0) ||
      (typeof savedInterestValue === 'string' && savedInterestValue.trim().length > 0));

  const hasLoanHistory =
    !loansResult.error && (loansResult.count ?? 0) > 0;

  return !hasSavedInterests && !hasLoanHistory;
}
