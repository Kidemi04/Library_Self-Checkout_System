// app/api/checkin/route.ts
import { NextResponse } from 'next/server';
import { checkIn } from '@/lib/sip2';

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
      // From your doc's "checkIn" example:
      noBlock: 'N',
      transactionDate: formatSipDate(now),
      returnDate: formatSipDate(now),
      currentLocation,
      institutionId: 'LIB001',
      itemIdentifier,
      terminalPassword: 'term123',
      itemProperties: 'Web kiosk',
      cancel: 'N',
    };

    const result = await checkIn(sipPayload);
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
