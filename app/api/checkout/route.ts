// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { checkOut } from '@/lib/sip2';

const SIP2_INSTITUTION_ID = process.env.SIP2_INSTITUTION_ID ?? 'LIB001';
const SIP2_TERMINAL_PASSWORD = process.env.SIP2_TERMINAL_PASSWORD ?? 'term123';
const SIP2_PATRON_PASSWORD = process.env.SIP2_PATRON_PASSWORD ?? 'patron456';

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
      scRenewalPolicy: 'Y',
      noBlock: 'N',
      transactionDate: formatSipDate(now),
      nbDueDate: formatSipDate(due),
      institutionId: SIP2_INSTITUTION_ID,
      patronIdentifier,
      itemIdentifier,
      terminalPassword: SIP2_TERMINAL_PASSWORD,
      itemProperties: 'Web kiosk',
      patronPassword: SIP2_PATRON_PASSWORD,
      feeAcknowledged: 'Y',
      cancel: 'N',
    };

    const result = await checkOut(sipPayload) as { status?: number };
    if (result?.status !== 1) {
      console.warn('[SIP2] Checkout returned non-OK status', result);
    }
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
