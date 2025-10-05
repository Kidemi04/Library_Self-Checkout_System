import { NextResponse } from 'next/server';
import { checkIn } from '@/lib/sip2';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await checkIn(payload);
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
