import { NextResponse } from 'next/server';
import { evaluateGuardrails } from '@/app/lib/recommendations/guardrails';
import { extractPreferences } from '@/app/lib/recommendations/ai';
import { retrieveCandidateBooks } from '@/app/lib/recommendations/retrieve';
import {
  buildAssociationRules,
  recommendBooks,
  type Recommendation,
} from '@/app/lib/recommendations/recommender';

type RecommendationRequest = {
  message?: string;
  limit?: number;
};

type RecommendationItem = {
  id: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  availableCopies: number;
  totalCopies: number;
  reason: string;
};

type RateLimitEntry = {
  windowStart: number;
  count: number;
  lastAt: number;
};

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 5;
const MIN_INTERVAL_MS = 1200;
const rateLimiter = new Map<string, RateLimitEntry>();

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getClientKey = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip') ?? request.headers.get('cf-connecting-ip');
  return realIp?.trim() || 'anonymous';
};

const toRecommendationItem = (rec: Recommendation): RecommendationItem => ({
  id: rec.book.id,
  title: rec.book.title,
  author: rec.book.author ?? null,
  coverImageUrl: rec.book.coverImageUrl ?? null,
  availableCopies: rec.book.availableCopies ?? 0,
  totalCopies: rec.book.totalCopies ?? 0,
  reason: rec.reasons[0] ?? 'Matches your interests',
});

const diversify = (recs: Recommendation[], limit: number): Recommendation[] => {
  const seenTitles = new Set<string>();
  const authorCounts = new Map<string, number>();
  const result: Recommendation[] = [];

  for (const rec of recs) {
    const titleKey = rec.book.title?.toLowerCase() ?? '';
    if (titleKey && seenTitles.has(titleKey)) continue;

    const authorKey = rec.book.author?.toLowerCase() ?? '';
    const authorCount = authorKey ? authorCounts.get(authorKey) ?? 0 : 0;
    if (authorKey && authorCount >= 2) continue;

    if (titleKey) seenTitles.add(titleKey);
    if (authorKey) authorCounts.set(authorKey, authorCount + 1);
    result.push(rec);

    if (result.length >= limit) break;
  }

  if (result.length >= limit) return result;

  for (const rec of recs) {
    if (result.includes(rec)) continue;
    result.push(rec);
    if (result.length >= limit) break;
  }

  return result;
};

export async function POST(request: Request) {
  let body: RecommendationRequest;

  try {
    body = (await request.json()) as RecommendationRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const message = String(body.message ?? '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const clientKey = getClientKey(request);
  const now = Date.now();
  const existing = rateLimiter.get(clientKey);
  const entry: RateLimitEntry = existing
    ? { ...existing }
    : { windowStart: now, count: 0, lastAt: 0 };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    entry.windowStart = now;
    entry.count = 0;
  }

  if (entry.lastAt && now - entry.lastAt < MIN_INTERVAL_MS) {
    return NextResponse.json(
      {
        ok: false,
        kind: 'rate_limited',
        reply: 'Please wait a moment before sending another message.',
      },
      { status: 429 },
    );
  }

  entry.count += 1;
  entry.lastAt = now;
  rateLimiter.set(clientKey, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    return NextResponse.json(
      {
        ok: false,
        kind: 'rate_limited',
        reply: 'Too many messages in a short time. Please wait and try again.',
      },
      { status: 429 },
    );
  }

  if (rateLimiter.size > 1000) {
    for (const [key, value] of rateLimiter.entries()) {
      if (now - value.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
        rateLimiter.delete(key);
      }
    }
  }

  const guardrail = evaluateGuardrails(message);
  if (guardrail.kind !== 'accept') {
    return NextResponse.json({
      ok: true,
      kind: guardrail.kind,
      reply: guardrail.reply,
      recommendations: [],
      interests: [],
      summary: null,
      followUpQuestion: null,
    });
  }

  try {
    const preference = await extractPreferences(message);
    const interestInput =
      preference.interests.length > 0 ? preference.interests.join(', ') : message;

    const requestedLimit = clamp(Number(body.limit ?? 6), 3, 8);
    const books = await retrieveCandidateBooks(interestInput);
    const associations = buildAssociationRules(books);
    const ranked = recommendBooks(
      books,
      interestInput,
      {
        onlyAvailable: true,
        favorPopular: true,
        limit: Math.max(12, requestedLimit * 2),
      },
      associations,
    );

    const finalList = diversify(ranked, requestedLimit);

    if (!finalList.length) {
      return NextResponse.json({
        ok: true,
        kind: 'no_matches',
        reply:
          'I could not find matches in the catalog. Try broader interests (genre, topic, mood, or course unit).',
        recommendations: [],
        interests: preference.interests,
        summary: preference.summary,
        followUpQuestion: preference.followUpQuestion,
      });
    }

    const items = finalList.map(toRecommendationItem);
    const replyLines = [
      `**Got it.** ${preference.summary}`,
      '',
      `Here are ${items.length} picks from the catalog:`,
      ...items.map(
        (item, index) =>
          `${index + 1}. ${item.title}${item.author ? ` - ${item.author}` : ''}`,
      ),
      '',
      `**Question:** ${preference.followUpQuestion}`,
    ];

    return NextResponse.json({
      ok: true,
      kind: 'recommendations',
      reply: replyLines.join('\n'),
      recommendations: items,
      interests: preference.interests,
      summary: preference.summary,
      followUpQuestion: preference.followUpQuestion,
    });
  } catch (error) {
    console.error('Recommendation service failed', error);
    return NextResponse.json(
      {
        ok: false,
        kind: 'error',
        reply: 'Recommendation service is unavailable. Please try again.',
      },
      { status: 500 },
    );
  }
}
