/**
 * scripts/seed-books-bulk.mjs
 *
 * Bulk-seed books into the Books table by querying Open Library's
 * /search.json?subject=... endpoint for each target category, filtering
 * for quality, and inserting the first N per category.
 *
 * Filters applied to every candidate:
 *   - title length ≥ 5
 *   - has at least one author
 *   - has a valid ISBN-13 starting with 978/979
 *   - first_publish_year ≥ 1960 (skip very old editions)
 *   - language includes English (if the language field is set)
 *   - not already in DB (dedup by ISBN)
 *
 * Usage:
 *   node scripts/seed-books-bulk.mjs           # dry-run (prints plan)
 *   node scripts/seed-books-bulk.mjs --apply   # insert
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

// ── Subject plan ───────────────────────────────────────────────────────────
// category = DB Books.category (must pass Books_category_check constraint).
// subjects = OL subject slugs to query (taken roughly from OL's subject taxonomy).
// target   = how many books we want to insert for this category.
const PLAN = [
  {
    category: 'Computer Science',
    target: 25,
    // Pair each subject with a positive `q` term to steer away from sci-fi and toward textbooks.
    queries: [
      'subject:"computer science" subject:"textbooks" NOT subject:fiction NOT subject:novel',
      'subject:"programming" subject:"textbooks" NOT subject:fiction',
      'subject:"algorithms" NOT subject:fiction NOT subject:novel',
      'subject:"software engineering" NOT subject:fiction',
      'subject:"machine learning" NOT subject:fiction',
      'subject:"data structures" NOT subject:fiction',
    ],
  },
  {
    category: 'Art & Design',
    target: 20,
    queries: [
      'subject:"graphic design" NOT subject:fiction',
      'subject:"typography" NOT subject:fiction',
      'subject:"photography" subject:"technique" NOT subject:fiction',
      'subject:"user experience" NOT subject:fiction',
      'subject:"industrial design" NOT subject:fiction',
    ],
  },
  {
    category: 'Business',
    target: 25,
    queries: [
      'subject:"entrepreneurship" NOT subject:fiction',
      'subject:"marketing" NOT subject:fiction',
      'subject:"finance" subject:"investment" NOT subject:fiction',
      'subject:"leadership" NOT subject:fiction',
      'subject:"management" subject:"business" NOT subject:fiction',
    ],
  },
  {
    category: 'Engineering',
    target: 25,
    queries: [
      'subject:"electrical engineering" NOT subject:fiction',
      'subject:"mechanical engineering" NOT subject:fiction',
      'subject:"civil engineering" NOT subject:fiction',
      'subject:"thermodynamics" NOT subject:fiction',
      'subject:"materials science" NOT subject:fiction',
      'subject:"control systems" NOT subject:fiction',
    ],
  },
  {
    category: 'Psychology',
    target: 20,
    queries: [
      'subject:"psychology" NOT subject:fiction NOT subject:novel',
      'subject:"cognitive psychology" NOT subject:fiction',
      'subject:"behavioral economics" NOT subject:fiction',
      'subject:"social psychology" NOT subject:fiction',
      'subject:"clinical psychology" NOT subject:fiction',
    ],
  },
  {
    category: 'Self-help',
    target: 20,
    queries: [
      'subject:"self-help" NOT subject:fiction NOT subject:novel',
      'subject:"personal development" NOT subject:fiction',
      'subject:"productivity" NOT subject:fiction',
      'subject:"motivational" NOT subject:fiction',
      'subject:"meditation" NOT subject:fiction',
    ],
  },
  {
    category: 'History',
    target: 20,
    queries: [
      'subject:"world history" NOT subject:fiction NOT subject:novel',
      'subject:"united states history" NOT subject:fiction',
      'subject:"european history" NOT subject:fiction',
      'subject:"military history" NOT subject:fiction',
      'subject:"biography" NOT subject:fiction',
      'subject:"world war ii" NOT subject:fiction NOT subject:novel',
      'subject:"ancient history" NOT subject:fiction',
    ],
  },
];

// Junk title patterns — reject proceedings, journal volumes, anthology editions, etc.
const REJECT_TITLE_RE = /\b(advances in|transactions on|proceedings|volume \d|vol\. \d|edition \d|lecture notes|handbook of)\b/i;

// Reject titles that are just numbers / symbols / very generic.
const JUNK_TITLES = new Set(['edition 1', 'edition 2', 'cover', 'untitled']);

// ── Helpers ────────────────────────────────────────────────────────────────
function fetchWithTimeout(url, opts = {}, ms = 20_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
}

function normalize(s) {
  return (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeBarcode() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `SWI-${n}`;
}

function pickIsbn(isbns) {
  if (!Array.isArray(isbns)) return null;
  const preferred = isbns.find((i) => typeof i === 'string' && /^97[89]\d{10}$/.test(i));
  return preferred ?? null;
}

function isQualityDoc(doc, existingTitles) {
  if (!doc.title || doc.title.length < 5) return null;
  if (doc.title.length > 90) return null; // very long titles are often edited volumes
  if (REJECT_TITLE_RE.test(doc.title)) return null;
  if (JUNK_TITLES.has(doc.title.toLowerCase())) return null;

  if (!Array.isArray(doc.author_name) || doc.author_name.length === 0) return null;
  if (!doc.first_publish_year || doc.first_publish_year < 1960) return null;

  // Prefer English — if `language` field exists, require 'eng' to be present.
  if (Array.isArray(doc.language) && doc.language.length > 0 && !doc.language.includes('eng')) {
    return null;
  }

  const isbn = pickIsbn(doc.isbn);
  if (!isbn) return null;

  // Dedupe by normalized title as a soft signal (avoid re-inserting same book
  // under a different ISBN edition than one we already seeded).
  const titleKey = normalize(doc.title);
  if (titleKey.length === 0) return null;
  if (existingTitles.has(titleKey)) return null;

  return {
    isbn,
    title: doc.title,
    author: doc.author_name[0],
    publisher: Array.isArray(doc.publisher) ? doc.publisher[0] ?? null : null,
    year: doc.first_publish_year ? String(doc.first_publish_year) : null,
    titleKey,
  };
}

async function fetchSearchDocs(query, limit = 50) {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      lang: 'eng',
      fields: 'title,author_name,isbn,first_publish_year,publisher,language',
      sort: 'editions',
    });
    const res = await fetchWithTimeout(
      `https://openlibrary.org/search.json?${params}`,
      { headers: { accept: 'application/json' } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.docs ?? [];
  } catch {
    return [];
  }
}

async function insertBook(meta, category) {
  const { data, error } = await supabase
    .from('Books')
    .insert({
      title: meta.title,
      author: meta.author,
      isbn: meta.isbn,
      publisher: meta.publisher,
      publication_year: meta.year,
      cover_image_url: `https://covers.openlibrary.org/b/isbn/${meta.isbn}-L.jpg`,
      category,
    })
    .select('id')
    .single();
  if (error) throw new Error(`Books: ${error.message}`);
  return data.id;
}

async function insertCopies(bookId, count) {
  const created = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const barcode = makeBarcode();
      const { error } = await supabase
        .from('Copies')
        .insert({ book_id: bookId, barcode, status: 'available' });
      if (!error) {
        created.push(barcode);
        break;
      }
      if (!/duplicate key/i.test(error.message)) {
        throw new Error(`Copies: ${error.message}`);
      }
    }
  }
  return created;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (inserts)' : 'DRY-RUN (no writes)'}\n`);

  // Load existing ISBNs + titles to dedupe against.
  const { data: existing } = await supabase
    .from('Books')
    .select('isbn, title');
  const existingIsbns = new Set();
  const existingTitleKeys = new Set();
  for (const r of existing ?? []) {
    if (r.isbn) existingIsbns.add(r.isbn.replace(/[^0-9X]/gi, '').toUpperCase());
    if (r.title) existingTitleKeys.add(normalize(r.title));
  }
  console.log(`Existing: ${existingIsbns.size} ISBNs, ${existingTitleKeys.size} titles\n`);

  const seenIsbns = new Set(existingIsbns);
  const seenTitleKeys = new Set(existingTitleKeys);
  const plannedBooks = []; // { meta, category, copies }

  for (const planEntry of PLAN) {
    console.log(`── ${planEntry.category} (target ${planEntry.target}) ──`);
    let collected = 0;

    for (const query of planEntry.queries) {
      if (collected >= planEntry.target) break;

      process.stdout.write(`  q=${query.slice(0, 48)}… → fetching… `);
      const docs = await fetchSearchDocs(query, 50);
      console.log(`${docs.length} docs`);

      for (const doc of docs) {
        if (collected >= planEntry.target) break;

        const meta = isQualityDoc(doc, seenTitleKeys);
        if (!meta) continue;
        if (seenIsbns.has(meta.isbn)) continue;

        seenIsbns.add(meta.isbn);
        seenTitleKeys.add(meta.titleKey);
        plannedBooks.push({
          meta,
          category: planEntry.category,
          copies: randomInt(1, 3),
        });
        collected++;
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`  → collected ${collected}/${planEntry.target}`);
  }

  console.log(`\n────────────── PLANNED ──────────────`);
  const byCategory = {};
  for (const b of plannedBooks) {
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
  }
  for (const [cat, n] of Object.entries(byCategory)) {
    console.log(`  ${cat.padEnd(18)} ${n}`);
  }
  console.log(`  TOTAL:              ${plannedBooks.length}`);

  if (!APPLY) {
    console.log('\nSample (first 10):');
    for (const b of plannedBooks.slice(0, 10)) {
      console.log(`  • ${b.meta.title} — ${b.meta.author} (${b.meta.year}) [${b.category}] ISBN ${b.meta.isbn}`);
    }
    console.log('\nDry-run complete. Re-run with --apply to insert.');
    return;
  }

  console.log(`\nInserting ${plannedBooks.length} books…`);
  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < plannedBooks.length; i++) {
    const b = plannedBooks[i];
    const label = `[${String(i + 1).padStart(3)}/${plannedBooks.length}] ${b.meta.title.slice(0, 48)}`;
    try {
      const bookId = await insertBook(b.meta, b.category);
      const copies = await insertCopies(bookId, b.copies);
      console.log(`${label} → ✓ ${copies.length} copies`);
      inserted++;
    } catch (err) {
      console.log(`${label} → ✗ ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Inserted ${inserted}, failed ${failed}.`);
}

main();
