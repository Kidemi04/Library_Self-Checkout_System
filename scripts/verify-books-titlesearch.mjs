/**
 * scripts/verify-books-titlesearch.mjs
 *
 * Two-pass verification for every book in the Books table:
 *   1. If the book has an ISBN, check /isbn/{isbn}.json on Open Library.
 *   2. If that fails (or there's no ISBN), fall back to /search.json?title=...&author=...
 *      and look for a close match (title similarity ≥ 0.6 + author surname match).
 *
 * Classifies every book into:
 *   ✓ Real        — ISBN already valid
 *   → Fixable     — real book with the wrong/missing ISBN (can be auto-corrected)
 *   ✗ Fake        — no match anywhere (delete candidate)
 *   ? API error   — transient network/API issue (left alone)
 *
 * Usage:
 *   node scripts/verify-books-titlesearch.mjs           # dry-run, prints plan
 *   node scripts/verify-books-titlesearch.mjs --apply   # update ISBNs + delete fakes
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

const APPLY = process.argv.includes('--apply');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Helpers ────────────────────────────────────────────────────────────────
function normalizeIsbn(raw) {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/[^0-9X]/gi, '').toUpperCase();
  if (cleaned.length !== 10 && cleaned.length !== 13) return null;
  return cleaned;
}

function fetchWithTimeout(url, opts = {}, ms = 10_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

async function existsByIsbn(isbn) {
  try {
    const res = await fetchWithTimeout(`https://openlibrary.org/isbn/${isbn}.json`, {
      headers: { accept: 'application/json' },
    });
    if (res.ok) return true;
    if (res.status === 404) return false;
    return 'error';
  } catch {
    return 'error';
  }
}

function normalize(s) {
  return (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function titleSimilarity(a, b) {
  const aWords = normalize(a).split(' ').filter((w) => w.length > 1);
  const bWords = normalize(b).split(' ').filter((w) => w.length > 1);
  if (aWords.length === 0 || bWords.length === 0) return 0;
  const aSet = new Set(aWords);
  const bSet = new Set(bWords);
  const [small, big] = aSet.size < bSet.size ? [aSet, bSet] : [bSet, aSet];
  let hits = 0;
  for (const w of small) if (big.has(w)) hits++;
  return hits / small.size;
}

// Generic author tokens that shouldn't be used for surname matching
const AUTHOR_STOPWORDS = new Set([
  'unknown', 'author', 'various', 'anon', 'anonymous', 'staff', 'team',
  'et', 'al', 'jr', 'sr', 'md', 'phd',
]);

function authorSurnameMatches(bookAuthor, apiAuthors) {
  if (!bookAuthor || !apiAuthors?.length) return false;
  const tokens = normalize(bookAuthor).split(' ').filter(Boolean);
  if (tokens.length === 0) return false;
  const surname = tokens[tokens.length - 1];
  if (surname.length < 3 || AUTHOR_STOPWORDS.has(surname)) return false;
  return apiAuthors.some((a) => normalize(a).includes(surname));
}

// Extract a surname to query with — OL author search is strict about
// initials/periods (e.g. "T. Cormen" returns 0 results but "Cormen" works).
function authorQueryToken(author) {
  if (!author) return null;
  const tokens = normalize(author).split(' ').filter(Boolean);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const t = tokens[i];
    if (t.length >= 3 && !AUTHOR_STOPWORDS.has(t)) return t;
  }
  return null;
}

async function searchByTitleAuthor(title, author) {
  try {
    const params = new URLSearchParams({
      title,
      limit: '5',
      // OL search.json returns a minimal doc by default; ISBN is omitted
      // unless explicitly requested in the fields list.
      fields: 'title,author_name,isbn,first_publish_year',
    });
    const authorToken = authorQueryToken(author);
    if (authorToken) params.set('author', authorToken);
    const res = await fetchWithTimeout(
      `https://openlibrary.org/search.json?${params}`,
      { headers: { accept: 'application/json' } },
      12_000,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const docs = data?.docs ?? [];
    if (!docs.length) return null;

    // Walk docs in order and return the first one that passes both thresholds.
    for (const doc of docs) {
      const simScore = titleSimilarity(title, doc.title ?? '');
      const authorOk = author
        ? authorSurnameMatches(author, doc.author_name ?? [])
        : simScore >= 0.8; // stricter title-only match when no author
      if (simScore < 0.6) continue;
      if (!authorOk) continue;

      // Prefer a 13-digit ISBN that starts with 978/979.
      const allIsbns = (doc.isbn ?? []).filter((i) => typeof i === 'string');
      const preferred = allIsbns.find((i) => /^97[89]\d{10}$/.test(i));
      const fallback = allIsbns.find((i) => /^\d{10}$/.test(i));
      const chosen = preferred ?? fallback ?? null;
      if (!chosen) continue;
      return {
        isbn: chosen,
        matchedTitle: doc.title ?? '(unknown)',
        matchedAuthor: (doc.author_name ?? []).join(', '),
        score: simScore,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Cascade delete ─────────────────────────────────────────────────────────
const TOLERATED_MISSING = /relation.*does not exist|column.*does not exist/i;

async function deleteBookCascade(bookId) {
  const { data: copies } = await supabase
    .from('Copies')
    .select('id')
    .eq('book_id', bookId);
  const copyIds = (copies ?? []).map((c) => c.id);

  const { data: holds } = await supabase
    .from('Holds')
    .select('id')
    .eq('book_id', bookId);
  const holdIds = (holds ?? []).map((h) => h.id);

  const { data: loans } = copyIds.length
    ? await supabase.from('Loans').select('id').in('copy_id', copyIds)
    : { data: [] };
  const loanIds = (loans ?? []).map((l) => l.id);

  // Delete NotificationQueue rows that reference holds / loans (schema may
  // have either/both columns — tolerate "column does not exist").
  if (holdIds.length > 0) {
    const { error } = await supabase
      .from('NotificationQueue')
      .delete()
      .in('hold_id', holdIds);
    if (error && !TOLERATED_MISSING.test(error.message)) {
      throw new Error(`NotificationQueue(hold): ${error.message}`);
    }
  }
  if (loanIds.length > 0) {
    const { error } = await supabase
      .from('NotificationQueue')
      .delete()
      .in('loan_id', loanIds);
    if (error && !TOLERATED_MISSING.test(error.message)) {
      throw new Error(`NotificationQueue(loan): ${error.message}`);
    }
  }

  if (copyIds.length > 0) {
    const { error } = await supabase.from('Loans').delete().in('copy_id', copyIds);
    if (error && !TOLERATED_MISSING.test(error.message)) {
      throw new Error(`Loans: ${error.message}`);
    }
  }

  const { error: holdErr } = await supabase.from('Holds').delete().eq('book_id', bookId);
  if (holdErr && !TOLERATED_MISSING.test(holdErr.message)) {
    throw new Error(`Holds: ${holdErr.message}`);
  }

  const { error: linkErr } = await supabase
    .from('BookTagsLinks')
    .delete()
    .eq('book_id', bookId);
  if (linkErr && !/relation.*does not exist/i.test(linkErr.message)) {
    throw new Error(`BookTagsLinks: ${linkErr.message}`);
  }

  if (copyIds.length > 0) {
    const { error } = await supabase.from('Copies').delete().eq('book_id', bookId);
    if (error) throw new Error(`Copies: ${error.message}`);
  }

  const { error } = await supabase.from('Books').delete().eq('id', bookId);
  if (error) throw new Error(`Books: ${error.message}`);
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

  console.log(`Mode: ${APPLY ? 'APPLY (will update + delete)' : 'DRY-RUN (no changes)'}`);
  console.log(`Scanning ${books.length} book(s) against Open Library (ISBN + title search)…\n`);

  const real = [];
  const fixable = []; // { book, newIsbn, matchedTitle, matchedAuthor, score }
  const fake = [];
  const apiError = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const label = `[${String(i + 1).padStart(3)}/${books.length}] ${(book.title ?? 'Untitled').slice(0, 48)}`;
    const isbn = normalizeIsbn(book.isbn);

    // Pass 1 — ISBN check
    if (isbn) {
      const result = await existsByIsbn(isbn);
      if (result === true) {
        console.log(`${label} → ✓ ISBN ok`);
        real.push(book);
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
      if (result === 'error') {
        console.log(`${label} → ? ISBN API error (keeping)`);
        apiError.push(book);
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
    }

    // Pass 2 — title + author search
    process.stdout.write(
      `${label} → ${isbn ? `ISBN ${isbn} miss, ` : 'no ISBN, '}searching by title… `,
    );
    const match = await searchByTitleAuthor(book.title ?? '', book.author);
    if (match) {
      console.log(`✓ matched "${match.matchedTitle.slice(0, 40)}" (sim ${match.score.toFixed(2)}) → ISBN ${match.isbn}`);
      fixable.push({ book, ...match });
    } else {
      console.log('✗ no match');
      fake.push(book);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n────────────── REPORT ──────────────');
  console.log(`✓ Real (ISBN ok):        ${real.length}`);
  console.log(`→ Fixable (update ISBN): ${fixable.length}   ← real books with wrong ISBN`);
  console.log(`✗ Fake (no match):       ${fake.length}   ← delete candidates`);
  console.log(`? API errors:            ${apiError.length}   ← kept`);

  if (fixable.length > 0) {
    console.log('\nBooks to fix (ISBN will be updated):');
    for (const f of fixable) {
      const oldIsbn = f.book.isbn ?? 'none';
      console.log(`   • ${f.book.title} — ${f.book.author ?? 'unknown'}`);
      console.log(
        `       ${oldIsbn} → ${f.isbn}   |   matched: "${f.matchedTitle}"` +
        (f.matchedAuthor ? ` / ${f.matchedAuthor.slice(0, 60)}` : ''),
      );
    }
  }

  if (fake.length > 0) {
    console.log('\nBooks to delete (no match anywhere):');
    for (const b of fake) {
      console.log(
        `   • ${b.title} — ${b.author ?? 'unknown'} (ISBN ${b.isbn ?? 'none'}) [id: ${b.id}]`,
      );
    }
  }

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to fix ISBNs and delete fakes.');
    return;
  }

  // ── Apply changes ────────────────────────────────────────────────────────
  let fixed = 0, fixFailed = 0, deleted = 0, delFailed = 0;

  if (fixable.length > 0) {
    console.log('\nFixing ISBNs…');
    for (const f of fixable) {
      const { error } = await supabase
        .from('Books')
        .update({ isbn: f.isbn })
        .eq('id', f.book.id);
      if (error) {
        console.log(`  ✗ fix failed: ${f.book.title} — ${error.message}`);
        fixFailed++;
      } else {
        console.log(`  ✓ fixed: ${f.book.title}`);
        fixed++;
      }
    }
  }

  if (fake.length > 0) {
    console.log('\nDeleting fakes (with cascaded copies/loans/holds/tag-links)…');
    for (const b of fake) {
      try {
        await deleteBookCascade(b.id);
        console.log(`  ✓ deleted: ${b.title}`);
        deleted++;
      } catch (err) {
        console.log(`  ✗ delete failed: ${b.title} — ${err.message}`);
        delFailed++;
      }
    }
  }

  console.log(
    `\nDone. Fixed ${fixed} (${fixFailed} failed), deleted ${deleted} (${delFailed} failed).`,
  );
}

main();
