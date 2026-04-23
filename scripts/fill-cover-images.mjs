/**
 * scripts/fill-cover-images.mjs
 *
 * For every book in the Books table that has an ISBN, fetch a cover image
 * and overwrite cover_image_url in Supabase.
 *
 * Order of sources (first one that returns a real cover wins):
 *   1. Open Library   (https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg)
 *   2. Google Books   (https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn})
 *
 * Rows already have a cover_image_url are overwritten regardless.
 *
 * Run:
 *   node scripts/fill-cover-images.mjs
 *
 * Requires .env.local to have:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   GOOGLE_BOOKS_API_KEY   — raises Google Books rate limit (not required)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Open Library ───────────────────────────────────────────────────────────
// Appending ?default=false makes OL return 404 when there's no real cover,
// instead of silently serving the placeholder gif. That's a much more
// reliable signal than trying to sniff content-length (which OL often
// omits on HEAD requests).
const openLibraryUrl = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

async function tryOpenLibrary(isbn) {
  try {
    const probe = `${openLibraryUrl(isbn)}?default=false`;
    const res = await fetch(probe, { method: 'HEAD', redirect: 'manual' });
    // 2xx/3xx = real cover exists; 404 = no cover; anything else = treat as no.
    if (res.status >= 200 && res.status < 400) return openLibraryUrl(isbn);
    return null;
  } catch {
    return null;
  }
}

// ── Google Books ───────────────────────────────────────────────────────────
// API: volumes?q=isbn:{isbn}  →  items[0].volumeInfo.imageLinks
// Prefer larger sizes if available: extraLarge > large > medium > small > thumbnail.
async function tryGoogleBooks(isbn) {
  try {
    const params = new URLSearchParams({
      q: `isbn:${isbn}`,
      maxResults: '1',
      fields: 'items(volumeInfo/imageLinks)',
    });
    if (GOOGLE_BOOKS_API_KEY) params.set('key', GOOGLE_BOOKS_API_KEY);

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const links = data?.items?.[0]?.volumeInfo?.imageLinks;
    if (!links) return null;

    const picked =
      links.extraLarge ||
      links.large ||
      links.medium ||
      links.small ||
      links.thumbnail ||
      links.smallThumbnail;

    if (!picked) return null;

    // Force https, drop the &edge=curl ribbon effect Google adds by default.
    return picked.replace(/^http:\/\//, 'https://').replace(/&edge=curl/g, '');
  } catch {
    return null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const { data: books, error } = await supabase
    .from('Books')
    .select('id, title, isbn, cover_image_url')
    .not('isbn', 'is', null);

  if (error) {
    console.error('Failed to fetch books:', error.message);
    process.exit(1);
  }

  console.log(`Scanning ${books.length} book(s) with an ISBN…\n`);

  let openLibraryHits = 0;
  let googleBooksHits = 0;
  let notFound = 0;
  let updateFailed = 0;

  for (const book of books) {
    const isbn = book.isbn?.trim().replace(/[^0-9X]/gi, '');
    const label = `[${(book.title ?? 'Untitled').slice(0, 48)}] ISBN ${isbn || '—'}`;

    if (!isbn) {
      console.log(`${label} → no valid ISBN, skip.`);
      notFound++;
      continue;
    }

    process.stdout.write(`${label} → `);

    let coverUrl = await tryOpenLibrary(isbn);
    let source = coverUrl ? 'Open Library' : null;

    if (!coverUrl) {
      coverUrl = await tryGoogleBooks(isbn);
      if (coverUrl) source = 'Google Books';
    }

    if (!coverUrl) {
      console.log('no cover found.');
      notFound++;
      // Polite delay even on miss so we don't hammer APIs.
      await new Promise((r) => setTimeout(r, 300));
      continue;
    }

    const { error: updateError } = await supabase
      .from('Books')
      .update({ cover_image_url: coverUrl })
      .eq('id', book.id);

    if (updateError) {
      console.log(`update failed (${source}): ${updateError.message}`);
      updateFailed++;
    } else {
      console.log(`✓ ${source}`);
      if (source === 'Open Library') openLibraryHits++;
      else googleBooksHits++;
    }

    // Be polite to both APIs
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(
    `\nDone. Open Library: ${openLibraryHits}, Google Books: ${googleBooksHits}, ` +
    `Not found: ${notFound}, Update failed: ${updateFailed}`,
  );
}

main();
