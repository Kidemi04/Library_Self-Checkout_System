/**
 * scripts/verify-books-openlibrary.mjs
 *
 * Verifies every book in the Books table against Open Library using its ISBN.
 * By default runs in DRY-RUN mode: prints a report of which books exist in
 * Open Library, which are missing (likely fake), and which lack an ISBN
 * (unverifiable). Pass --delete to actually remove the missing ones.
 *
 * Open Library endpoint:
 *   https://openlibrary.org/isbn/{isbn}.json    → 200 real, 404 not found
 *
 * Usage:
 *   node scripts/verify-books-openlibrary.mjs             # dry-run (safe)
 *   node scripts/verify-books-openlibrary.mjs --delete    # delete fakes
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

const DELETE_MODE = process.argv.includes('--delete');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── ISBN helpers ───────────────────────────────────────────────────────────
function normalizeIsbn(raw) {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/[^0-9X]/gi, '').toUpperCase();
  if (cleaned.length !== 10 && cleaned.length !== 13) return null;
  return cleaned;
}

// ── Open Library check ────────────────────────────────────────────────────
async function existsOnOpenLibrary(isbn) {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      method: 'GET',
      redirect: 'follow',
      headers: { accept: 'application/json' },
    });
    // 200 → exists. 404 → not found. 5xx → treat as unknown (keep).
    if (res.ok) return true;
    if (res.status === 404) return false;
    return 'error';
  } catch {
    return 'error';
  }
}

// ── Cascade delete: Loans referencing Copies → Copies → Book ──────────────
async function deleteBookCascade(bookId) {
  // 1. Find copy ids for this book
  const { data: copies } = await supabase
    .from('Copies')
    .select('id')
    .eq('book_id', bookId);
  const copyIds = (copies ?? []).map((c) => c.id);

  // 2. Delete loans referencing those copies
  if (copyIds.length > 0) {
    const { error: loanErr } = await supabase
      .from('Loans')
      .delete()
      .in('copy_id', copyIds);
    if (loanErr && !/relation.*does not exist/i.test(loanErr.message)) {
      throw new Error(`Loans delete: ${loanErr.message}`);
    }
  }

  // 3. Delete holds for this book (if Holds table exists)
  const { error: holdErr } = await supabase
    .from('Holds')
    .delete()
    .eq('book_id', bookId);
  if (holdErr && !/relation.*does not exist/i.test(holdErr.message)) {
    throw new Error(`Holds delete: ${holdErr.message}`);
  }

  // 4. Delete book_tag_links for this book
  const { error: linkErr } = await supabase
    .from('BookTagsLinks')
    .delete()
    .eq('book_id', bookId);
  if (linkErr && !/relation.*does not exist/i.test(linkErr.message)) {
    throw new Error(`BookTagsLinks delete: ${linkErr.message}`);
  }

  // 5. Delete copies
  if (copyIds.length > 0) {
    const { error: copyErr } = await supabase
      .from('Copies')
      .delete()
      .eq('book_id', bookId);
    if (copyErr) throw new Error(`Copies delete: ${copyErr.message}`);
  }

  // 6. Finally delete the book
  const { error: bookErr } = await supabase
    .from('Books')
    .delete()
    .eq('id', bookId);
  if (bookErr) throw new Error(`Book delete: ${bookErr.message}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const { data: books, error } = await supabase
    .from('Books')
    .select('id, title, author, isbn')
    .order('title');

  if (error) {
    console.error('Failed to fetch books:', error.message);
    process.exit(1);
  }

  console.log(`Mode: ${DELETE_MODE ? 'DELETE' : 'DRY-RUN (no changes)'}`);
  console.log(`Scanning ${books.length} book(s) against Open Library…\n`);

  const real = [];
  const fake = [];
  const noIsbn = [];
  const apiError = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const isbn = normalizeIsbn(book.isbn);
    const label = `[${String(i + 1).padStart(3)}/${books.length}] ${(book.title ?? 'Untitled').slice(0, 50)}`;

    if (!isbn) {
      console.log(`${label} → no ISBN`);
      noIsbn.push(book);
      continue;
    }

    process.stdout.write(`${label} (ISBN ${isbn}) → `);
    const result = await existsOnOpenLibrary(isbn);
    if (result === true) {
      console.log('✓ found');
      real.push(book);
    } else if (result === 'error') {
      console.log('? API error (keeping)');
      apiError.push(book);
    } else {
      console.log('✗ not in Open Library');
      fake.push(book);
    }

    // Be polite — Open Library rate limit is 100/5min for anonymous.
    await new Promise((r) => setTimeout(r, 250));
  }

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n────────────── REPORT ──────────────');
  console.log(`✓ Confirmed real:       ${real.length}`);
  console.log(`✗ Not in Open Library:  ${fake.length}   ← delete candidates`);
  console.log(`? No ISBN:              ${noIsbn.length}   ← unverifiable, left alone`);
  console.log(`! API errors:           ${apiError.length}   ← kept (retry later)`);

  if (fake.length > 0) {
    console.log('\nCandidates for deletion (not found on Open Library):');
    for (const b of fake) {
      console.log(
        `   • ${b.title} — ${b.author ?? 'unknown author'} (ISBN ${b.isbn}) [id: ${b.id}]`,
      );
    }
  }

  if (noIsbn.length > 0 && noIsbn.length <= 40) {
    console.log('\nNo-ISBN books (review manually, not touched):');
    for (const b of noIsbn) {
      console.log(`   • ${b.title} — ${b.author ?? 'unknown author'} [id: ${b.id}]`);
    }
  } else if (noIsbn.length > 40) {
    console.log(`\n(${noIsbn.length} no-ISBN books — list hidden, too long)`);
  }

  // ── Delete phase ─────────────────────────────────────────────────────────
  if (!DELETE_MODE) {
    console.log('\nDry-run complete. Re-run with --delete to remove the candidates above.');
    return;
  }

  if (fake.length === 0) {
    console.log('\nNothing to delete.');
    return;
  }

  console.log(`\nDeleting ${fake.length} book(s) + their copies/loans/holds/tag-links…`);
  let deleted = 0;
  let failed = 0;
  for (const b of fake) {
    try {
      await deleteBookCascade(b.id);
      console.log(`  ✓ deleted: ${b.title}`);
      deleted++;
    } catch (err) {
      console.log(`  ✗ failed:  ${b.title} — ${err.message}`);
      failed++;
    }
  }
  console.log(`\nDeleted ${deleted}, failed ${failed}.`);
}

main();
