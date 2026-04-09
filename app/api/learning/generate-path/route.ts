import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';

export type GeneratePathRequest = {
  topic: string;
};

export type GeneratedPathStep = {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  bookQuery: string;
  bookTitle: string;
  courseQuery: string;
  courseTitle: string;
};

export type GeneratePathResponse = {
  ok: boolean;
  steps?: GeneratedPathStep[];
  error?: string;
};

const GEMINI_PATH_PROMPT = `
You are an expert librarian and syllabus designer. Evaluate the user's requested learning topic and design a 3-step learning path moving strictly from Beginner, to Intermediate, to Advanced difficulty.

For each tier, recommend exactly one well-known foundational book and exactly one highly rated LinkedIn Learning curriculum topic.

Return ONLY valid JSON in this exact structure:
{
  "steps": [
    {
      "difficulty": "Beginner",
      "bookTitle": "...",
      "bookQuery": "keywords to search library catalogue",
      "courseTitle": "...",
      "courseQuery": "keywords to search linkedin learning"
    },
    ... (Intermediate and Advanced)
  ]
}
No extra text. Only JSON.
`;

export async function POST(request: Request) {
  let body: GeneratePathRequest;

  try {
    const { user } = await getDashboardSession();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
    }
    body = (await request.json()) as GeneratePathRequest;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request payload.' }, { status: 400 });
  }

  const topic = String(body.topic ?? '').trim();
  if (!topic) {
    return NextResponse.json({ ok: false, error: 'Topic is required.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const baseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Gemini AI is not configured.' }, { status: 503 });
  }

  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const aiBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: GEMINI_PATH_PROMPT },
            { text: `Topic: ${topic}` }
          ]
        }
      ],
      generationConfig: { temperature: 0.3 }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiBody),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
    const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: { steps?: GeneratedPathStep[] } | null = null;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed || !Array.isArray(parsed.steps) || parsed.steps.length !== 3) {
      return NextResponse.json({ ok: false, error: 'Failed to extract valid path progression.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, steps: parsed.steps });

  } catch (error) {
    console.error('[Generate Path] AI failed:', error);
    return NextResponse.json({ ok: false, error: 'Service unavailable.' }, { status: 500 });
  }
}
