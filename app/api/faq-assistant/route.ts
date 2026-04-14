import { NextResponse } from 'next/server';
import { getDashboardSession } from '@/app/lib/auth/session';

export type FaqKind = 'tutorial' | 'answer' | 'greeting' | 'off_topic' | 'error';

export type FaqAssistantResponse = {
  kind: FaqKind;
  reply: string;
  steps?: string[];
};

type Provider = 'gemini' | 'lmstudio';

const getEnv = () => ({
  provider: (process.env.LLM_PROVIDER?.trim().toLowerCase() as Provider | undefined) ?? undefined,
  geminiBaseUrl:
    process.env.GEMINI_API_BASE_URL?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  lmstudioBaseUrl: process.env.LMSTUDIO_BASE_URL?.trim() || 'http://localhost:1234/v1',
  lmstudioModel: process.env.LMSTUDIO_MODEL?.trim() || 'google/gemma-4-e4b',
});

const LIBRARY_KNOWLEDGE = `
LIBRARY SYSTEM KNOWLEDGE BASE:

HOW TO BORROW A BOOK (3 steps):
Step 1 - Find the book: Go to "Borrow Books" from the side navigation or bottom menu. You have two ways to find a title: Search by title, author, or ISBN using the search box; or tap the camera icon to open the barcode scanner and point it at the barcode on the book's back cover.
Step 2 - Confirm loan details: The system shows the title, copy details, and your due date. The default loan period is 14 days from today. Check the correct copy is selected — if it is on loan, the system suggests an available one.
Step 3 - Complete checkout: Tap "Borrow" to confirm. The loan is recorded instantly and appears under Active Loans on your dashboard. No staff or stamp needed. You will receive a due date reminder notification.

LOAN PERIOD & DUE DATES:
- Standard loan period is 14 days from the borrow date.
- Due date is shown at checkout and listed in the Active Loans section of the dashboard.
- Check the Notifications page for upcoming due date reminders.
- Renewals: Open Active Loans, select the book, tap "Renew" to extend by 14 more days. Renewal may be unavailable if another student placed a hold on the title.
- Overdue: Items are flagged in the system; staff may contact you. Return as soon as possible. Persistent overdue items may affect future borrowing.

RETURNING BOOKS:
- Bring the physical book to the library service desk on Level 1.
- Staff will scan it to mark it as returned. Verify by checking Active Loans — the item disappears once processed.
- If a returned book still shows as active, wait a few minutes and refresh. If it persists, contact the service desk with your student ID and the title.

BARCODE SCANNER:
- On the Borrow Books page, tap the camera icon, or go to Camera Scan from the bottom navigation.
- Hold device camera steady at the barcode on the back cover within the frame. It detects automatically.
- Troubleshooting: Ensure barcode is clean and not torn. Use better lighting or enable torch. Hold camera 10–15 cm away. If scanner fails, search by title or ISBN instead.

ACCOUNT & NOTIFICATIONS:
- Sign in using your Swinburne Microsoft account (@student.swinburne.edu.my). Personal emails are not supported.
- Login loop fix: clear browser cookies and try again.
- Update contact details: Go to My Profile in the side navigation, edit email or phone under "Contact & details", and save.
- Overdue reminders are sent when an item is approaching or past its due date. If you returned the item but still get reminders, contact the service desk.

CONTACT:
- Service desk: Level 1, open weekdays 8:00 AM – 9:00 PM.
- Email: library@swinburne.edu.my (include student ID).
- Phone: +6082 260936.
`;

const SYSTEM_PROMPT = `You are a friendly and helpful library assistant for the Swinburne University Malaysia library self-checkout system.
Your only job is to help students understand and use the library system.

${LIBRARY_KNOWLEDGE}

You must respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.

Response format:
{
  "kind": "tutorial" | "answer" | "greeting" | "off_topic",
  "reply": "A short, friendly opening sentence or answer (plain text, no markdown, no asterisks, no bullet symbols).",
  "steps": ["step 1 plain text", "step 2 plain text"]
}

Rules:
- "tutorial": use when the user asks HOW to do something (borrow, return, scan, renew, etc.). Include numbered "steps" array with each step as a clear plain-text string. Do NOT include step numbers in the steps strings themselves.
- "answer": use for factual questions (loan period, due dates, overdue policy, contact info, etc.). Put the full answer in "reply". Use an empty "steps" array [].
- "greeting": for hi/hello/how are you. Reply warmly and mention you can guide them through any library task. Empty "steps" array.
- "off_topic": for anything unrelated to the library system. Politely decline and invite them to ask about borrowing, returning, or using the system. Empty "steps" array.
- All text must be plain English. No asterisks, no bullet symbols, no markdown formatting.
- Never reveal what AI model you are. You are "Library Assistant".
- Keep replies concise and encouraging.`;

const extractJson = (raw: string): string => {
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
};

const callLMStudio = async (userMessage: string): Promise<string | null> => {
  const { lmstudioBaseUrl, lmstudioModel } = getEnv();
  try {
    const response = await fetch(`${lmstudioBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: lmstudioModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 600,
        stream: false,
        reasoning: { effort: 'none' },
      }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
};

let geminiDisabled = false;

const callGemini = async (userMessage: string): Promise<string | null> => {
  if (geminiDisabled) return null;
  const { geminiBaseUrl, geminiApiKey, geminiModel } = getEnv();
  if (!geminiApiKey) return null;
  try {
    const url = `${geminiBaseUrl}/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
      }),
    });
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      if (response.status === 429 || response.status === 503) {
        geminiDisabled = true;
      }
      console.error('[Gemini FAQ] error', response.status, err);
      return null;
    }
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
};

const callAi = async (userMessage: string): Promise<string | null> => {
  const { provider } = getEnv();

  if (provider === 'lmstudio') {
    return callLMStudio(userMessage);
  }
  if (provider === 'gemini') {
    return callGemini(userMessage);
  }

  // Auto: try Gemini first, fallback to LM Studio
  const geminiResult = await callGemini(userMessage);
  if (geminiResult) return geminiResult;
  return callLMStudio(userMessage);
};

const parseResponse = (raw: string): FaqAssistantResponse => {
  try {
    const jsonStr = extractJson(raw);
    const parsed = JSON.parse(jsonStr) as Partial<FaqAssistantResponse>;
    const kind: FaqKind =
      parsed.kind === 'tutorial' ||
      parsed.kind === 'answer' ||
      parsed.kind === 'greeting' ||
      parsed.kind === 'off_topic'
        ? parsed.kind
        : 'answer';
    return {
      kind,
      reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '',
      steps: Array.isArray(parsed.steps)
        ? (parsed.steps as unknown[]).filter((s): s is string => typeof s === 'string')
        : [],
    };
  } catch {
    return { kind: 'error', reply: raw.trim(), steps: [] };
  }
};

// Rate limiting
type RateLimitEntry = { windowStart: number; count: number };
const rateLimiter = new Map<string, RateLimitEntry>();
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 5;

const getClientKey = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'anonymous';
};

export async function POST(request: Request) {
  const { user } = await getDashboardSession();
  if (!user || user.role !== 'user') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit
  const clientKey = getClientKey(request);
  const now = Date.now();
  const entry = rateLimiter.get(clientKey);
  if (entry && now - entry.windowStart < RATE_WINDOW_MS) {
    if (entry.count >= RATE_MAX) {
      return NextResponse.json(
        {
          kind: 'error',
          reply: 'You are sending messages too quickly. Please wait a moment and try again.',
          steps: [],
        } satisfies FaqAssistantResponse,
        { status: 429 },
      );
    }
    entry.count++;
  } else {
    rateLimiter.set(clientKey, { windowStart: now, count: 1 });
  }

  let message = '';
  try {
    const body = (await request.json()) as { message?: unknown };
    if (typeof body.message === 'string') message = body.message.trim().slice(0, 500);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const raw = await callAi(message);

  if (!raw) {
    // Fallback: keyword-match from FAQ data
    const lower = message.toLowerCase();
    const isBorrow = /borrow|checkout|check.?out|how.+book/.test(lower);
    const isReturn = /return|give.?back|bring.?back/.test(lower);
    const isScanner = /scan|barcode|camera/.test(lower);
    const isDue = /due|loan|period|renew|late|overdue/.test(lower);
    const isAccount = /login|sign.?in|account|profile|contact|notification|reminder/.test(lower);

    if (isBorrow) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to borrow a book using the self-checkout system:',
        steps: [
          'Go to "Borrow Books" from the side navigation or bottom menu. Search by title, author, or ISBN — or tap the camera icon to scan the barcode on the back cover.',
          'The system will show the title, copy details, and your due date (14 days from today). Make sure the correct copy is selected.',
          'Tap "Borrow" to confirm. The loan is recorded instantly and appears under Active Loans on your dashboard. You will receive a reminder as the due date approaches.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isReturn) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to return a book:',
        steps: [
          'Bring the physical book to the library service desk on Level 1.',
          'A staff member will scan it to mark it as returned. You can verify this by checking your Active Loans — the item will disappear once processed.',
          'If the book still shows as active after a few minutes, refresh the page. If it persists, contact the service desk with your student ID and the book title.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isScanner) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to use the barcode scanner:',
        steps: [
          'Tap the camera icon on the Borrow Books page, or go to Camera Scan from the bottom navigation.',
          'Point your device camera at the barcode on the back cover of the book. Hold steady and keep the barcode within the frame — it will detect automatically.',
          'If scanning fails: ensure the barcode is clean, use better lighting, and hold the camera 10–15 cm away. As a fallback, search by title or ISBN instead.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isDue) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'The standard loan period is 14 days. Your due date is shown at checkout and listed under Active Loans on your dashboard. To renew, open Active Loans, select the book, and tap "Renew" to extend by another 14 days — as long as no one else has placed a hold on it. Overdue items are flagged and may affect future borrowing.',
        steps: [],
      } satisfies FaqAssistantResponse);
    }
    if (isAccount) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'Sign in using your Swinburne Microsoft account (@student.swinburne.edu.my). If you are stuck in a login loop, clear your browser cookies and try again. To update your contact details, go to My Profile in the side navigation and edit under "Contact & details".',
        steps: [],
      } satisfies FaqAssistantResponse);
    }

    return NextResponse.json({
      kind: 'answer',
      reply: 'I am here to help! You can ask me how to borrow a book, return a book, use the barcode scanner, check your due dates, or manage your account. What would you like to know?',
      steps: [],
    } satisfies FaqAssistantResponse);
  }

  const result = parseResponse(raw);
  return NextResponse.json(result);
}
