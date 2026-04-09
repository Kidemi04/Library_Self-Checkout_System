import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchUserContext, saveUserInterests } from '@/app/lib/recommendations/user-context';

export async function GET() {
  const { user } = await getDashboardSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { savedInterests } = await fetchUserContext(user.id);
  return NextResponse.json({ interests: savedInterests });
}

export async function POST(request: Request) {
  const { user } = await getDashboardSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { interests?: unknown };
  try {
    body = (await request.json()) as { interests?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  if (!Array.isArray(body.interests)) {
    return NextResponse.json({ error: 'interests must be an array.' }, { status: 400 });
  }

  const interests = (body.interests as unknown[])
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0 && v.length <= 60)
    .slice(0, 30);

  try {
    await saveUserInterests(user.id, interests);
    return NextResponse.json({ ok: true, interests });
  } catch (error) {
    console.error('Failed to save user interests', error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : 'Failed to save interests.';
    return NextResponse.json(
      {
        error: message,
        code: error && typeof error === 'object' && 'code' in error ? (error as any).code : undefined,
      },
      { status: 500 },
    );
  }
}
