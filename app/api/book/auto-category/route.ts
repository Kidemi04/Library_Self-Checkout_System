import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/auth';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

type BookCategory = 'Computer Science' | 'Business' | 'Art & Design' | 'Engineering';
const VALID_CATEGORIES: BookCategory[] = ['Computer Science', 'Business', 'Art & Design', 'Engineering'];

type MinimalBook = {
  id: string;
  title: string;
  author: string | null;
  classification: string | null;
  tags: string[];
};

const getGeminiEnv = () => {
  const rawBase =
    process.env.GEMINI_API_BASE_URL?.trim() ||
    'https://generativelanguage.googleapis.com';
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  const needsBeta = model.startsWith('gemini-2');
  const apiVersion = needsBeta ? 'v1beta' : 'v1';
  const baseRoot = rawBase.replace(/\/?(v1|v1beta)\/?$/i, '');
  const baseUrl = `${baseRoot.replace(/\/+$/, '')}/${apiVersion}`;
  return { baseUrl, apiKey, model };
};

const buildPrompt = (books: MinimalBook[]): string => {
  const lines = books.map((b, idx) => {
    const parts = [
      `title="${b.title}"`,
      b.author ? `author="${b.author}"` : null,
      b.classification ? `class="${b.classification}"` : null,
      b.tags.length ? `tags="${b.tags.slice(0, 5).join(', ')}"` : null,
    ].filter(Boolean);
    return `b${idx}: ${parts.join(', ')}`;
  });

  return [
    'Classify each book into EXACTLY ONE category from this list:',
    '- Computer Science',
    '- Business',
    '- Art & Design',
    '- Engineering',
    '',
    'Return ONLY valid JSON: {"b0": "Computer Science", "b1": "Engineering", ...}',
    'Rules: use the exact category name with correct casing; every key must have a value; no extra text.',
    '',
    'Books:',
    ...lines,
  ].join('\n');
};

const inferFallback = (book: MinimalBook): BookCategory => {
  const text = [book.title, book.author, book.classification, ...book.tags]
    .join(' ')
    .toLowerCase();

  if (/computer|software|program|code|algorithm|data|ai|machine.?learning|database|network|cyber|security|web|javascript|python/.test(text))
    return 'Computer Science';
  if (/engineer|mechanical|electrical|civil|chemical|mechatronics|robotics|control|thermo|materials|circuit/.test(text))
    return 'Engineering';
  if (/design|art|creative|graphic|multimedia|visual|ux|ui|typography|illustration/.test(text))
    return 'Art & Design';
  if (/business|management|finance|marketing|accounting|economics|entrepreneur|commerce|banking|investment/.test(text))
    return 'Business';

  return 'Computer Science';
};

async function callGemini(books: MinimalBook[]): Promise<Record<string, BookCategory>> {
  const { baseUrl, apiKey, model } = getGeminiEnv();
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');

  const url = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(books) }] }],
    generationConfig: { temperature: 0.1 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini ${res.status}: ${errText}`);
  }

  const data = await res.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text.trim()) throw new Error('Gemini returned empty response');

  // Strip markdown code fences if present
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed: Record<string, string> | null = null;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }

  if (!parsed) throw new Error('Gemini returned non-JSON');

  const result: Record<string, BookCategory> = {};
  for (const [key, val] of Object.entries(parsed)) {
    const cat = VALID_CATEGORIES.find((c) => c === val);
    if (cat) result[key] = cat;
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    await requireStaff();

    const supabase = getSupabaseServerClient();

    const body = await req.json().catch(() => null);
    const recategorize: boolean = Boolean(body?.recategorize);

    // Load books that need categorization
    let query = supabase
      .from('Books')
      .select(`id, title, author, classification, book_tag_links:BookTagsLinks(tag:BookTags(name))`)
      .order('title')
      .limit(200);

    if (!recategorize) {
      query = query.is('category', null);
    }

    const { data, error } = await query;
    if (error) throw error;

    const books: MinimalBook[] = (data ?? []).map((b: any) => ({
      id: b.id,
      title: b.title ?? 'Untitled',
      author: b.author ?? null,
      classification: b.classification ?? null,
      tags: (b.book_tag_links ?? [])
        .map((l: any) => l?.tag?.name)
        .filter((n: any): n is string => typeof n === 'string' && n.length > 0),
    }));

    if (!books.length) {
      return NextResponse.json({ ok: true, categorized: 0 });
    }

    let categorized = 0;
    const chunkSize = 20;

    for (let i = 0; i < books.length; i += chunkSize) {
      const slice = books.slice(i, i + chunkSize);

      let geminiResult: Record<string, BookCategory> = {};
      try {
        geminiResult = await callGemini(slice);
      } catch (err) {
        console.warn('[auto-category] Gemini failed, using heuristic fallback', err);
      }

      await Promise.all(
        slice.map(async (book, idx) => {
          const key = `b${idx}`;
          const category = geminiResult[key] ?? inferFallback(book);

          const { error: updateError } = await supabase
            .from('Books')
            .update({ category })
            .eq('id', book.id);

          if (updateError) {
            console.error(`[auto-category] failed to update book ${book.id}`, updateError);
          } else {
            categorized += 1;
          }
        }),
      );
    }

    return NextResponse.json({ ok: true, categorized });
  } catch (err: unknown) {
    console.error('[auto-category] error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.toLowerCase().includes('unauthorized') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
