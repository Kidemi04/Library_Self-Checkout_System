/**
 * scripts/verify-covers.mjs
 *
 * Checks every Books.cover_image_url in the DB against the live host:
 *   - 200 + body >= 2KB  → real cover  ✓
 *   - 200 + body <  2KB  → placeholder (Open Library returns ~807-byte "no cover" img)
 *   - 404 / other error  → missing
 *
 * Prints a summary and lists the books that aren't showing a real cover.
 *
 * Usage:
 *   node scripts/verify-covers.mjs                  # dry-run, prints report
 *   node scripts/verify-covers.mjs --null-missing   # also NULL-out broken URLs so the UI
 *                                                   # falls back to the BookCover gradient
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const NULL_MISSING = process.argv.includes('--null-missing');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function fetchWithTimeout(url, opts = {}, ms = 10_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

/**
 * Returns 'ok' | 'missing' | 'error'.
 *
 * Open Library returns a placeholder image (200 OK, no 404) when there is no
 * cover for an ISBN. Appending `?default=false` makes it 404 instead, which
 * gives us a reliable way to detect "no cover available".
 *
 * For Google Books / other hosts we fall back to the original URL + HEAD.
 */
async function checkCover(url) {
  try {
    const isOpenLibrary = /covers\.openlibrary\.org/.test(url);
    const probeUrl = isOpenLibrary
      ? url + (url.includes('?') ? '&default=false' : '?default=false')
      : url;

    let res = await fetchWithTimeout(probeUrl, { method: 'HEAD', redirect: 'manual' });
    // Treat any 2xx or 3xx (redirect to real image) as OK.
    if (res.status >= 200 && res.status < 400) return 'ok';
    if (res.status === 404) return 'missing';

    // Retry with GET for hosts that refuse HEAD.
    if (res.status === 405 || res.status === 403) {
      res = await fetchWithTimeout(probeUrl, { method: 'GET' });
      if (res.status >= 200 && res.status < 400) return 'ok';
      if (res.status === 404) return 'missing';
    }

    return 'error';
  } catch {
    return 'error';
  }
}

async function main() {
  const { data: books, error } = await supabase
    .from('Books')
    .select('id, title, author, isbn, cover_image_url')
    .order('title');

  if (error) {
    console.error('Failed to fetch books:', error.message);
    process.exit(1);
  }

  console.log(`Scanning cover URLs for ${books.length} book(s)…\n`);

  let okCount = 0;
  let missingCount = 0;
  let errorCount = 0;
  let noUrl = 0;

  const missing = [];
  const errors = [];
  const urlsMissing = [];

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const label = `[${String(i + 1).padStart(3)}/${books.length}] ${(b.title ?? 'Untitled').slice(0, 44)}`;

    if (!b.cover_image_url) {
      console.log(`${label} → – no URL set`);
      noUrl++;
      urlsMissing.push(b);
      continue;
    }

    process.stdout.write(`${label} → `);
    const result = await checkCover(b.cover_image_url);
    if (result === 'ok') {
      console.log('✓');
      okCount++;
    } else if (result === 'missing') {
      console.log('✗ no cover');
      missingCount++;
      missing.push(b);
    } else {
      console.log('? error');
      errorCount++;
      errors.push(b);
    }

    await new Promise((r) => setTimeout(r, 120));
  }

  console.log('\n────────────── SUMMARY ──────────────');
  console.log(`Total books:         ${books.length}`);
  console.log(`✓ Real cover:        ${okCount}`);
  console.log(`✗ No cover:          ${missingCount}   ← URL returns 404 via ?default=false`);
  console.log(`? Network error:     ${errorCount}`);
  console.log(`– No URL set:        ${noUrl}`);

  const showList = (label, list) => {
    if (!list.length) return;
    console.log(`\n${label}:`);
    for (const b of list.slice(0, 50)) {
      console.log(`  • ${b.title} — ${b.author ?? 'unknown'} (ISBN ${b.isbn ?? '—'})`);
    }
    if (list.length > 50) console.log(`  … +${list.length - 50} more`);
  };

  showList('Books without a real cover', missing);
  showList('Books with network errors', errors);
  showList('Books without any cover_image_url', urlsMissing);

  if (NULL_MISSING && missing.length > 0) {
    console.log(`\nNULL-ing cover_image_url on ${missing.length} book(s) so the UI falls back to BookCover gradient…`);
    const ids = missing.map((b) => b.id);
    const { error: updateError } = await supabase
      .from('Books')
      .update({ cover_image_url: null })
      .in('id', ids);
    if (updateError) {
      console.error(`  ✗ failed: ${updateError.message}`);
    } else {
      console.log(`  ✓ updated ${missing.length} rows`);
    }
  } else if (missing.length > 0) {
    console.log(`\nRe-run with --null-missing to NULL-out the ${missing.length} broken URLs.`);
    console.log(`(Later, once Google Books quota resets, run fill-cover-images.mjs to try to fill them via GB.)`);
  }
}

main();
