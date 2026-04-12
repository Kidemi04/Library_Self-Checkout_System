/**
 * scripts/fill-cover-images.mjs
 *
 * Fetches cover images from Open Library for books that are missing one,
 * using their ISBN. Updates cover_image_url in the Supabase Books table.
 *
 * Run:
 *   node scripts/fill-cover-images.mjs
 *
 * Requires .env.local to have:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Open Library cover URL — -L = large, -M = medium, -S = small
const coverUrl = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// Open Library returns a tiny placeholder (< 1 KB) when no cover exists.
// Check Content-Length to skip those.
async function coverExists(isbn) {
  try {
    const res = await fetch(coverUrl(isbn), { method: 'HEAD' });
    if (!res.ok) return false;
    const length = res.headers.get('content-length');
    // Real covers are usually > 5 KB; placeholder is ~807 bytes
    return length ? parseInt(length, 10) > 2000 : true;
  } catch {
    return false;
  }
}

async function main() {
  // Fetch all books with an ISBN (overwrite existing covers too)
  const { data: books, error } = await supabase
    .from('Books')
    .select('id, title, isbn, cover_image_url')
    .not('isbn', 'is', null);

  if (error) {
    console.error('Failed to fetch books:', error.message);
    process.exit(1);
  }

  console.log(`Found ${books.length} books with ISBN but missing cover image.\n`);

  let updated = 0;
  let skipped = 0;

  for (const book of books) {
    const isbn = book.isbn?.trim().replace(/[^0-9X]/gi, '');
    if (!isbn) { skipped++; continue; }

    process.stdout.write(`[${book.title}] ISBN ${isbn} — checking... `);

    const exists = await coverExists(isbn);
    if (!exists) {
      console.log('no cover found, skipping.');
      skipped++;
      continue;
    }

    const url = coverUrl(isbn);
    const { error: updateError } = await supabase
      .from('Books')
      .update({ cover_image_url: url })
      .eq('id', book.id);

    if (updateError) {
      console.log(`update failed: ${updateError.message}`);
      skipped++;
    } else {
      console.log(`✓ updated`);
      updated++;
    }

    // Small delay to be polite to Open Library's API
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nDone. Updated: ${updated}, Skipped/not found: ${skipped}`);
}

main();
