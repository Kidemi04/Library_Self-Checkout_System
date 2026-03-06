import { createClient as createSupabaseJsClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

const getSupabaseUrl = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing Supabase URL. Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.');
  return url;
};

const getSupabaseKey = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return key;
};

export const getSupabaseServerClient = (): SupabaseClient => {
  if (cachedClient) return cachedClient;
  cachedClient = createSupabaseJsClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
};

// ✅ Alias expected by your other files (e.g., updates.ts)
export function createClient(): SupabaseClient {
  return getSupabaseServerClient();
}
