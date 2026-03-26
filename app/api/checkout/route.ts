// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { checkOut } from '@/lib/sip2';
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

    const patronIdentifier = String(body.patronIdentifier ?? '').trim();
    const itemIdentifier   = String(body.itemIdentifier ?? '').trim();
    const dueDateStr       = String(body.dueDate ?? '').trim(); // e.g. "2025-01-25"

    if (!patronIdentifier || !itemIdentifier) {
      return NextResponse.json(
        { success: false, error: 'Missing patronIdentifier or itemIdentifier' },
        { status: 400 },
      );
    }

    const now = new Date();
    const due = dueDateStr
      ? new Date(dueDateStr + 'T00:00:00')
      : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // fallback 14 days

    const sipPayload = {
      // From your doc's "checkOut" example:
      scRenewalPolicy: 'Y',
      noBlock: 'N',
      transactionDate: formatSipDate(now),
      nbDueDate: formatSipDate(due),
      institutionId: 'LIB001',
      patronIdentifier,            // 👈 from app
      itemIdentifier,              // 👈 from app
      terminalPassword: 'term123',
      itemProperties: 'Web kiosk',
      patronPassword: 'patron456',
      feeAcknowledged: 'Y',
      cancel: 'N',
    };

    const result = await checkOut(sipPayload);

    // Fire notification (non-blocking, non-critical)
    lookupBookByBarcode(itemIdentifier)
      .then(({ title, author }) =>
        createNotification(
          'checkout',
          'Book Borrowed',
          `"${title}" was checked out by ${patronIdentifier}.`,
          { bookTitle: title, bookAuthor: author, barcode: itemIdentifier, patronIdentifier },
        ),
      )
      .catch((err) => console.warn('[notifications] checkout notification failed:', err));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Checkout API error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed',
      },
      { status: 500 },
    );
  }
}
