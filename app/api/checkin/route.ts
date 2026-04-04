// app/api/checkin/route.ts
import { NextResponse } from 'next/server';
import { checkIn } from '@/lib/sip2';

const SIP2_INSTITUTION_ID = process.env.SIP2_INSTITUTION_ID ?? 'LIB001';
const SIP2_TERMINAL_PASSWORD = process.env.SIP2_TERMINAL_PASSWORD ?? 'term123';

// SIP2 format: YYYYMMDDZZZZHHMMSS (18 chars)
// ZZZZ = timezone offset in HHMM (e.g. 0800 for UTC+8)
const pad = (n: number) => n.toString().padStart(2, '0');

function formatSipDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());

  const offsetMinutes = -date.getTimezoneOffset();
  const abs = Math.abs(offsetMinutes);
  const zzzz = pad(Math.floor(abs / 60)) + pad(abs % 60);

  return `${yyyy}${mm}${dd}${zzzz}${hh}${min}${ss}`;
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
      institutionId: SIP2_INSTITUTION_ID,
      itemIdentifier,
      terminalPassword: SIP2_TERMINAL_PASSWORD,
      itemProperties: 'Web kiosk',
      cancel: 'N',
    };

    const result = await checkIn(sipPayload) as { status?: number };
    if (result?.status !== 1) {
      console.warn('[SIP2] Checkin returned non-OK status', result);
    }
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
