import { NextResponse } from 'next/server';
import { checkOut } from '@/lib/sip2';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await checkOut(payload);
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
