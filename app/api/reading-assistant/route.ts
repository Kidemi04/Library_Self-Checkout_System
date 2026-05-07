import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { getSessionUser } from '@/auth';
import { classifyAndExtract } from '@/app/lib/recommendations/ai';
import { fetchBooks } from '@/app/lib/supabase/queries';

type ReadingAssistantBook = {
  id: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  classification: string | null;
  isbn: string | null;
};

async function currentUserId(): Promise<string | null> {
  try {
    const user = await getSessionUser();
    return user.id;
  } catch {
    return null;
  }
}

async function persistTurn(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  userId: string,
  sender: 'user' | 'assistant',
  text: string,
): Promise<void> {
  const { error } = await supabase.from('GeneralChatHistory').insert({
    user_id: userId,
    sender,
    text,
  });
  if (error) console.error('[reading-assistant] persist error:', error.message);
}

export async function POST(request: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({} as Record<string, unknown>));
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // 1. AI classify + reply
  const aiResult = await classifyAndExtract(message);

  // 2. Search books when intent calls for it
  let books: ReadingAssistantBook[] | undefined;
  if (aiResult.intent === 'find_books' || aiResult.intent === 'both') {
    const term = (aiResult.searchTerms ?? [])[0];
    if (term) {
      const rows = await fetchBooks(term);
      if (rows && rows.length > 0) {
        books = rows.slice(0, 5).map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author ?? null,
          coverImageUrl: b.coverImageUrl ?? null,
          classification: b.classification ?? null,
          isbn: b.isbn ?? null,
        }));
      }
    }
  }

  // 3. Persist user msg + assistant msg (after AI succeeds)
  await persistTurn(supabase, userId, 'user', message);
  await persistTurn(supabase, userId, 'assistant', aiResult.reply);

  return NextResponse.json({
    reply: aiResult.reply,
    intent: aiResult.intent,
    ...(books && books.length > 0 ? { books } : {}),
  });
}
