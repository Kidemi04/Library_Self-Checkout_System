// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { checkOut } from '@/lib/sip2';

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
