import {
  createClient as createSupabaseJsClient,
  SupabaseClient,
} from '@supabase/supabase-js';

const getSupabaseUrl = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('Missing Supabase URL');
  return url;
};

const getSupabaseKey = () => {
  // IMPORTANT:
  // Server-side only key
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return key;
};

// ✅ SYNC
// ✅ NO singleton
// ✅ NO cookies
// ✅ NO auth state
export function getSupabaseServerClient(): SupabaseClient {
  return createSupabaseJsClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Keep old API name
export function createClient(): SupabaseClient {
  return getSupabaseServerClient();
}
