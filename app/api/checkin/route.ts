// app/api/checkin/route.ts
import { NextResponse } from 'next/server';
import { checkIn } from '@/lib/sip2';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import { createNotification } from '@/app/lib/supabase/notifications';

// Format as: "YYYYMMDDHHmmss000"
function formatSipDate(date: Date): string {
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds()) +
    '000'
  );
}

async function lookupBookByBarcode(barcode: string): Promise<{ title: string; author: string }> {
  const supabase = getSupabaseServerClient();
  // Step 1: resolve copy → book_id
  const { data: copy } = await supabase
    .from('copies')
    .select('book_id')
    .eq('barcode', barcode)
    .maybeSingle();
  if (!copy?.book_id) return { title: barcode, author: '' };
  // Step 2: fetch book title/author
  const { data: book } = await supabase
    .from('books')
    .select('title, author')
    .eq('id', copy.book_id)
    .maybeSingle();
  return {
    title: (book as { title?: string; author?: string } | null)?.title ?? barcode,
    author: (book as { title?: string; author?: string } | null)?.author ?? '',
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const itemIdentifier = String(body.itemIdentifier ?? body.barcode ?? '').trim();
    const currentLocation = String(body.currentLocation ?? 'Main Library');

    if (!itemIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Missing itemIdentifier' },
        { status: 400 },
      );
    }

    const now = new Date();

    const sipPayload = {
      noBlock: 'N',
      transactionDate: formatSipDate(now),
      returnDate: formatSipDate(now),
      currentLocation,
      institutionId: process.env.SIP2_INSTITUTION_ID ?? 'LIB001',
      itemIdentifier,
      terminalPassword: process.env.SIP2_TERMINAL_PASSWORD ?? '',
      itemProperties: 'Web kiosk',
      cancel: 'N',
    };

    const result = await checkIn(sipPayload);

    // Fire notification (non-blocking, non-critical)
    lookupBookByBarcode(itemIdentifier)
      .then(({ title, author }) =>
        createNotification(
          'checkin',
          'Book Returned',
          `"${title}" has been returned.`,
          { bookTitle: title, bookAuthor: author, barcode: itemIdentifier },
        ),
      )
      .catch((err) => console.warn('[notifications] checkin notification failed:', err));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Check-in API error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Check-in failed',
      },
      { status: 500 },
    );
  }
}
