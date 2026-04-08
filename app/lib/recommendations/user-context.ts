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
  interests: string[] | null;
};

/**
 * Fetches the user's loan history tags (from borrowed books' BookTags) and
 * their saved interests from UserInterests. Both DB calls run in parallel.
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

    supabase
      .from('UserInterests')
      .select('interests')
      .eq('user_id', userId)
      .maybeSingle<RawUserInterestsRow>(),
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
    if (Array.isArray(raw)) {
      savedInterests.push(
        ...raw
          .map((v) => String(v).trim().toLowerCase())
          .filter((v) => v.length > 0),
      );
    }
  }

  return { historyTags, savedInterests };
}

/**
 * Saves (upserts) the user's interests into UserInterests table.
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

  const { error } = await supabase
    .from('UserInterests')
    .upsert(
      { user_id: userId, interests: sanitized, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    );

  if (error) throw error;
}

/**
 * Returns true if the user has at least one saved interest OR any loan history.
 * Used by the chat page to decide whether to show the onboarding tag selector.
 */
export async function userNeedsOnboarding(userId: string): Promise<boolean> {
  if (!userId) return true;

  const supabase = getSupabaseServerClient();

  const [interestsResult, loansResult] = await Promise.all([
    supabase
      .from('UserInterests')
      .select('interests')
      .eq('user_id', userId)
      .maybeSingle<RawUserInterestsRow>(),

    supabase
      .from('Loans')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .limit(1),
  ]);

  const hasSavedInterests =
    !interestsResult.error &&
    Array.isArray(interestsResult.data?.interests) &&
    (interestsResult.data?.interests?.length ?? 0) > 0;

  const hasLoanHistory =
    !loansResult.error && (loansResult.count ?? 0) > 0;

  return !hasSavedInterests && !hasLoanHistory;
}
