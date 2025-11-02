'use client';

import { createBrowserClient } from '@supabase/ssr';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a Supabase client for the browser
export const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
