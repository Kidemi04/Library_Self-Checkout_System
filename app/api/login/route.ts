import { NextResponse } from 'next/server';
import { login } from '@/lib/sip2';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await login(payload);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Login API error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      },
      { status: 500 },
    );
  }
}
