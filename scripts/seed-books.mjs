/**
 * scripts/seed-books.mjs
 *
 * Seed real books into the Books table using Open Library as the source of
 * truth for metadata (title, author, publisher, year, ISBN, cover).
 *
 * For each seed entry we:
 *   1. Search Open Library by title+author to get the canonical ISBN.
 *   2. Skip if that ISBN already exists in our Books table.
 *   3. Insert a new Books row with OL-derived metadata.
 *   4. Create N Copies (barcode SWI-XXXXX) with status 'available'.
 *
 * Usage:
 *   node scripts/seed-books.mjs           # dry-run (prints plan)
 *   node scripts/seed-books.mjs --apply   # actually inserts
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

// ── Seed list ──────────────────────────────────────────────────────────────
// title / author are what we search Open Library for. OL is authoritative
// for the actual stored title+author+ISBN — these fields are just the query.
const SEED_BOOKS = [
  // ── Computing ────────────────────────────────────────────────────────────
  { title: 'Clean Code',                     author: 'Robert C. Martin',   category: 'Computer Science',   copies: 3 },
  { title: 'Clean Architecture',             author: 'Robert C. Martin',   category: 'Computer Science',   copies: 2 },
  { title: 'Design Patterns',                author: 'Erich Gamma',        category: 'Computer Science',   copies: 2 },
  { title: 'Refactoring',                    author: 'Martin Fowler',      category: 'Computer Science',   copies: 2 },
  { title: 'The Pragmatic Programmer',       author: 'David Thomas',       category: 'Computer Science',   copies: 3 },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Computer Science', copies: 2 },
  { title: 'Effective Java',                 author: 'Joshua Bloch',       category: 'Computer Science',   copies: 2 },
  { title: 'The C Programming Language',     author: 'Brian Kernighan',    category: 'Computer Science',   copies: 2 },
  { title: 'Head First Design Patterns',     author: 'Eric Freeman',       category: 'Computer Science',   copies: 2 },
  { title: 'Code Complete',                  author: 'Steve McConnell',    category: 'Computer Science',   copies: 2 },
  { title: 'The Mythical Man-Month',         author: 'Frederick Brooks',   category: 'Computer Science',   copies: 2 },
  { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', category: 'Computer Science', copies: 1 },

  // ── Design ───────────────────────────────────────────────────────────────
  { title: "Don't Make Me Think",            author: 'Steve Krug',         category: 'Art & Design',      copies: 3 },
  { title: 'The Design of Everyday Things',  author: 'Donald Norman',      category: 'Art & Design',      copies: 3 },
  { title: 'About Face',                     author: 'Alan Cooper',        category: 'Art & Design',      copies: 2 },
  { title: 'Universal Principles of Design', author: 'William Lidwell',    category: 'Art & Design',      copies: 2 },
  { title: 'Thinking with Type',             author: 'Ellen Lupton',       category: 'Art & Design',      copies: 2 },
  { title: 'Grid Systems in Graphic Design', author: 'Josef Müller-Brockmann', category: 'Art & Design',  copies: 1 },
  { title: 'Creative Confidence',            author: 'Tom Kelley',         category: 'Art & Design',      copies: 2 },
  { title: 'Hooked',                         author: 'Nir Eyal',           category: 'Art & Design',      copies: 2 },

  // ── Business ─────────────────────────────────────────────────────────────
  { title: 'The Lean Startup',               author: 'Eric Ries',          category: 'Business',    copies: 3 },
  { title: 'Zero to One',                    author: 'Peter Thiel',        category: 'Business',    copies: 2 },
  { title: 'Good to Great',                  author: 'Jim Collins',        category: 'Business',    copies: 2 },
  { title: 'Built to Last',                  author: 'Jim Collins',        category: 'Business',    copies: 2 },
  { title: 'Start with Why',                 author: 'Simon Sinek',        category: 'Business',    copies: 2 },
  { title: 'Crossing the Chasm',             author: 'Geoffrey Moore',     category: 'Business',    copies: 2 },
  { title: 'The Innovator\'s Dilemma',       author: 'Clayton Christensen', category: 'Business',   copies: 2 },
  { title: 'Blue Ocean Strategy',            author: 'W. Chan Kim',        category: 'Business',    copies: 2 },

  // ── Engineering ──────────────────────────────────────────────────────────
  { title: 'Fundamentals of Electric Circuits', author: 'Charles Alexander', category: 'Engineering', copies: 2 },
  { title: 'Introduction to Electrodynamics', author: 'David Griffiths',   category: 'Engineering',  copies: 2 },
  { title: 'Mechanics of Materials',         author: 'Russell Hibbeler',   category: 'Engineering',  copies: 2 },
  { title: 'Fluid Mechanics',                author: 'Frank White',        category: 'Engineering',  copies: 2 },
  { title: 'Modern Control Engineering',     author: 'Katsuhiko Ogata',    category: 'Engineering',  copies: 2 },
  { title: 'Digital Design',                 author: 'Morris Mano',        category: 'Engineering',  copies: 2 },
  { title: 'Engineering Mechanics: Dynamics', author: 'Russell Hibbeler',  category: 'Engineering',  copies: 2 },

  // ── Psychology ───────────────────────────────────────────────────────────
  { title: 'Grit',                           author: 'Angela Duckworth',   category: 'Psychology',  copies: 3 },
  { title: 'Flow',                           author: 'Mihaly Csikszentmihalyi', category: 'Psychology', copies: 2 },
  { title: 'Quiet',                          author: 'Susan Cain',         category: 'Psychology',  copies: 2 },
  { title: 'The Body Keeps the Score',       author: 'Bessel van der Kolk', category: 'Psychology', copies: 2 },
  { title: 'Outliers',                       author: 'Malcolm Gladwell',   category: 'Psychology',  copies: 2 },
  { title: 'Blink',                          author: 'Malcolm Gladwell',   category: 'Psychology',  copies: 2 },
  { title: 'Predictably Irrational',         author: 'Dan Ariely',         category: 'Psychology',  copies: 2 },
  { title: 'Nudge',                          author: 'Richard Thaler',     category: 'Psychology',  copies: 2 },
  { title: 'Man\'s Search for Meaning',      author: 'Viktor Frankl',      category: 'Psychology',  copies: 3 },

  // ── Self-help ────────────────────────────────────────────────────────────
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', category: 'Self-help', copies: 3 },
  { title: 'Mindset',                        author: 'Carol Dweck',        category: 'Self-help',   copies: 3 },
  { title: 'The Power of Habit',             author: 'Charles Duhigg',     category: 'Self-help',   copies: 2 },
  { title: 'The Life-Changing Magic of Tidying Up', author: 'Marie Kondo', category: 'Self-help',   copies: 2 },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson',   category: 'Self-help',   copies: 2 },
  { title: 'Daring Greatly',                 author: 'Brené Brown',        category: 'Self-help',   copies: 2 },
  { title: 'Drive',                          author: 'Daniel H. Pink',     category: 'Self-help',   copies: 2 },
  { title: 'How to Win Friends and Influence People', author: 'Dale Carnegie', category: 'Self-help', copies: 3 },

  // ── History ──────────────────────────────────────────────────────────────
  { title: 'Guns, Germs, and Steel',         author: 'Jared Diamond',      category: 'History',     copies: 2 },
  { title: 'A Short History of Nearly Everything', author: 'Bill Bryson',  category: 'History',     copies: 2 },
  { title: 'The Silk Roads',                 author: 'Peter Frankopan',    category: 'History',     copies: 2 },
  { title: 'Homo Deus',                      author: 'Yuval Noah Harari',  category: 'History',     copies: 2 },
  { title: '21 Lessons for the 21st Century', author: 'Yuval Noah Harari', category: 'History',     copies: 2 },
  { title: "A People's History of the United States", author: 'Howard Zinn', category: 'History',   copies: 1 },
  { title: 'The Emperor of All Maladies',    author: 'Siddhartha Mukherjee', category: 'History',   copies: 1 },
  { title: 'The Rise and Fall of the Third Reich', author: 'William L. Shirer', category: 'History', copies: 1 },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function fetchWithTimeout(url, opts = {}, ms = 12_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(timer));
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

function authorSurnameMatches(author, apiAuthors) {
  if (!author || !apiAuthors?.length) return false;
  const tokens = normalize(author).split(' ').filter(Boolean);
  const surname = tokens[tokens.length - 1];
  if (!surname || surname.length < 3) return false;
  return apiAuthors.some((a) => normalize(a).includes(surname));
}

async function searchOpenLibrary(title, author) {
  try {
    const tokens = normalize(author).split(' ').filter(Boolean);
    const authorToken = tokens[tokens.length - 1];
    const params = new URLSearchParams({
      title,
      author: authorToken ?? '',
      limit: '5',
      fields: 'title,author_name,isbn,first_publish_year,publisher',
    });
    const res = await fetchWithTimeout(
      `https://openlibrary.org/search.json?${params}`,
      { headers: { accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const docs = data?.docs ?? [];
    for (const doc of docs) {
      const sim = titleSimilarity(title, doc.title ?? '');
      if (sim < 0.6) continue;
      if (!authorSurnameMatches(author, doc.author_name ?? [])) continue;

      const isbns = (doc.isbn ?? []).filter((i) => typeof i === 'string');
      const preferred = isbns.find((i) => /^97[89]\d{10}$/.test(i));
      const fallback = isbns.find((i) => /^\d{10}$/.test(i));
      const chosen = preferred ?? fallback ?? null;
      if (!chosen) continue;

      const firstAuthor = (doc.author_name ?? [])[0] ?? author;
      const publisher = (doc.publisher ?? [])[0] ?? null;
      return {
        isbn: chosen,
        title: doc.title ?? title,
        author: firstAuthor,
        publisher,
        year: doc.first_publish_year ? String(doc.first_publish_year) : null,
        score: sim,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function makeBarcode() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `SWI-${n}`;
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
  if (error) throw new Error(`Books insert: ${error.message}`);
  return data.id;
}

async function insertCopies(bookId, count) {
  const attempts = [];
  for (let i = 0; i < count; i++) {
    // retry up to 3 times if barcode collides
    let inserted = false;
    for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
      const barcode = makeBarcode();
      const { error } = await supabase
        .from('Copies')
        .insert({ book_id: bookId, barcode, status: 'available' });
      if (!error) {
        attempts.push(barcode);
        inserted = true;
      } else if (!/duplicate key/i.test(error.message)) {
        throw new Error(`Copies insert: ${error.message}`);
      }
    }
  }
  return attempts;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (inserts)' : 'DRY-RUN (no writes)'}`);
  console.log(`Seed list has ${SEED_BOOKS.length} entries.\n`);

  // Cache existing ISBNs to skip duplicates early
  const { data: existing } = await supabase.from('Books').select('isbn').not('isbn', 'is', null);
  const existingIsbns = new Set(
    (existing ?? [])
      .map((r) => (r.isbn ?? '').replace(/[^0-9X]/gi, '').toUpperCase())
      .filter(Boolean),
  );
  console.log(`Existing ISBNs in DB: ${existingIsbns.size}\n`);

  let inserted = 0;
  let skipped = 0;
  let notFound = 0;
  let errored = 0;

  for (let i = 0; i < SEED_BOOKS.length; i++) {
    const seed = SEED_BOOKS[i];
    const label = `[${String(i + 1).padStart(2)}/${SEED_BOOKS.length}] ${seed.title.slice(0, 45)} — ${seed.author}`;

    process.stdout.write(`${label} → `);
    const meta = await searchOpenLibrary(seed.title, seed.author);

    if (!meta) {
      console.log('✗ not found on Open Library');
      notFound++;
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    if (existingIsbns.has(meta.isbn)) {
      console.log(`– skip (ISBN ${meta.isbn} already in DB)`);
      skipped++;
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    if (!APPLY) {
      console.log(`✓ would add: ${meta.title} / ${meta.author} (ISBN ${meta.isbn}, ${seed.copies} copies)`);
      inserted++;
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }

    try {
      const bookId = await insertBook(meta, seed.category);
      const barcodes = await insertCopies(bookId, seed.copies);
      console.log(`✓ inserted: ${meta.title} (ISBN ${meta.isbn}, copies: ${barcodes.join(', ')})`);
      existingIsbns.add(meta.isbn);
      inserted++;
    } catch (err) {
      console.log(`✗ error: ${err.message}`);
      errored++;
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  console.log('\n────────────── SUMMARY ──────────────');
  console.log(`${APPLY ? 'Inserted' : 'Would insert'}:   ${inserted}`);
  console.log(`Skipped (dup):          ${skipped}`);
  console.log(`Not found (OL miss):    ${notFound}`);
  console.log(`Errors:                 ${errored}`);
  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to insert.');
  }
}

main();
