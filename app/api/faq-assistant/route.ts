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
LIBRARY SYSTEM KNOWLEDGE BASE — Swinburne University of Technology Sarawak Campus Library:

LOAN PERIODS, LIMITS & FINES BY MATERIAL TYPE:

General Collection:
- Academic Staff: up to 50 items, 60-day loan, RM0.50/day fine, 60-day renewal
- Postgraduates: up to 20 items, 30-day loan, RM0.50/day fine, 30-day renewal
- Non-Academic Staff: up to 10 items, 30-day loan, RM0.50/day fine, 30-day renewal
- Students: up to 10 items, 14-day loan, RM0.50/day fine, 7-day renewal

Staff Collection:
- Academic Staff: 60-day loan, RM0.50/day fine, 60-day renewal
- Postgraduates: 30-day loan, RM0.50/day fine, 30-day renewal
- Non-Academic Staff: 30-day loan, RM0.50/day fine, 30-day renewal
- Students: Overnight loan only, RM1.00/hour fine, no renewal

Reference Materials (all patron types):
- 3-day loan, RM0.50/day fine, no renewal

Periodicals & Newspapers:
- Non-circulating. Not available for loan.

HOW TO BORROW (self-checkout system):
Step 1 - Find the book: Go to "Borrow Books" from the side navigation or bottom menu. Search by title, author, or ISBN; or tap the camera icon to scan the barcode on the back cover of the book.
Step 2 - Confirm loan details: The system shows the title, copy details, and your due date. Check the correct copy is selected — if it is on loan, the system suggests an available one.
Step 3 - Complete checkout: Tap "Borrow" to confirm. The loan is recorded instantly and appears under Active Loans on your dashboard. You will receive a due date reminder notification.
Important: You must use your Swinburne ID card to borrow. Borrowing can also be done at the self-check machine in the bookshelves area. Ensure all books are checked out at the self-check machine before removing them to avoid triggering the RFID alarm.

HOW TO RENEW:
- Online: Log in to My Account on the dashboard and select Renew next to the item.
- Mobile app: Download the "Swinburne Sarawak Library" app from the App Store or Google Play.
- In person: Visit library counters.
- By phone: Call +6082 260 936 during opening hours.
- By email: library@swinburne.edu.my
- You can renew any time before the item is due. Renewal is for the standard renewal period for your patron category.
- You CANNOT renew if: you have overdue loans, unpaid fines, someone has placed a hold on the item, or your library membership has expired.

HOW TO RETURN:
- Return items at the library counters.
- Verify by checking your Active Loans on the dashboard — the item disappears once processed.
- If a returned book still shows as active, wait a few minutes and refresh. If it persists, contact the service desk.

FINES & AVOIDING FINES:
- Fines are RM0.50/day for general/staff/reference; RM1.00/hour for student overnight staff collection loans.
- To avoid fines: renew on or before the due date online or via the mobile app. Check your account regularly.
- Never lend your student ID card or borrow on someone else's behalf. All fees on your account are your responsibility.
- Report lost ID cards to the library immediately.

MAKING PAYMENTS:
- At the counter: pay via e-wallet by scanning the QR code at the counter.
- By email: contact library@swinburne.edu.my and the library will provide a QR code.

LOST OR DAMAGED ITEMS:
- You must pay a replacement cost (current price if in print, or average subject-area price if out of print) plus an administration fee of RM50.00.
- You can replace the item with a new copy or a new edition.
- You cannot borrow or renew until outstanding charges are paid or the item is replaced.
- Failure to pay may result in suspension of borrowing privileges and withholding of testamur.

BARCODE SCANNER (self-checkout system):
- On the Borrow Books page, tap the camera icon, or go to Camera Scan from the bottom navigation.
- Hold device camera steady at the barcode on the back cover within the frame. It detects automatically.
- Troubleshooting: Ensure barcode is clean and not torn. Use better lighting or enable torch. Hold camera 10–15 cm away. If scanner fails, search by title or ISBN instead.

ACCOUNT & NOTIFICATIONS:
- Sign in using your Swinburne Microsoft account (@student.swinburne.edu.my). Personal emails are not supported.
- Login loop fix: clear browser cookies and try again.
- Update contact details: Go to My Profile in the side navigation, edit email or phone under "Contact & details", and save.
- Overdue reminders are sent when an item is approaching or past its due date. If you returned the item but still get reminders, contact the service desk.

CONTACT:
- Phone: +6082 260 936 (during opening hours)
- Email: library@swinburne.edu.my (include your student ID)
- Counter payments and in-person help available at the library.
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
    // Fallback: keyword-match from library policy
    const lower = message.toLowerCase();
    const isBorrow = /borrow|checkout|check.?out|how.+book/.test(lower);
    const isReturn = /return|give.?back|bring.?back/.test(lower);
    const isScanner = /scan|barcode|camera/.test(lower);
    const isDue = /due date|loan period|how long|keep a book/.test(lower);
    const isRenew = /renew|extend|renewal/.test(lower);
    const isOverdue = /overdue|late|fine|fee|penalty/.test(lower);
    const isLost = /lost|damage|replace|replacement/.test(lower);
    const isPayment = /pay|payment|wallet|qr/.test(lower);
    const isAccount = /login|sign.?in|account|profile|contact|notification|reminder/.test(lower);

    if (isBorrow) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to borrow a book using the self-checkout system:',
        steps: [
          'Make sure you have your Swinburne ID card. Go to "Borrow Books" from the side navigation or bottom menu. Search by title, author, or ISBN — or tap the camera icon to scan the barcode on the back cover.',
          'The system will show the title, copy details, and your due date. Students can borrow up to 10 general-collection items for 14 days. Make sure the correct copy is selected.',
          'Tap "Borrow" to confirm. The loan is recorded instantly and appears under Active Loans on your dashboard. You will receive a reminder as the due date approaches. Ensure books are checked out before leaving the bookshelves area to avoid triggering the RFID alarm.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isReturn) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to return a book:',
        steps: [
          'Bring the physical book to the library counters.',
          'A staff member will process the return. You can verify by checking your Active Loans on the dashboard — the item disappears once processed.',
          'If the book still shows as active after a few minutes, refresh the page. If it persists, contact the library at library@swinburne.edu.my or call +6082 260 936.',
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
          'If scanning fails: ensure the barcode is clean and not torn, use better lighting, and hold the camera 10–15 cm away. As a fallback, search by title or ISBN instead.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isRenew) {
      return NextResponse.json({
        kind: 'tutorial',
        reply: 'Here is how to renew your loans:',
        steps: [
          'Online: Log in to My Account on the dashboard and select Renew next to the item. Students get a 7-day renewal for general collection items.',
          'Via mobile app: Download the "Swinburne Sarawak Library" app from the App Store or Google Play and renew from there.',
          'In person, by phone (+6082 260 936), or by email (library@swinburne.edu.my) during opening hours. Note: you cannot renew if you have overdue loans, unpaid fines, a hold placed on the item, or an expired library membership.',
        ],
      } satisfies FaqAssistantResponse);
    }
    if (isOverdue) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'Fines for students are RM0.50 per day for general collection, reference, and staff collection items. For overnight staff collection loans, the fine is RM1.00 per hour. To avoid fines: renew on or before the due date online, via the Swinburne Sarawak Library app, in person, or by calling +6082 260 936. Never lend your student ID card — all fees on your account are your responsibility.',
        steps: [],
      } satisfies FaqAssistantResponse);
    }
    if (isLost) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'For lost or damaged items you must pay the replacement cost (current price if in print, or average subject-area price if out of print) plus an administration fee of RM50.00. You can replace the item with a new copy or a new edition. You cannot borrow or renew until outstanding charges are settled. Failure to pay may result in suspension of borrowing privileges and withholding of testamur.',
        steps: [],
      } satisfies FaqAssistantResponse);
    }
    if (isPayment) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'You can pay library fines in two ways: (1) At the library counter — pay via e-wallet by scanning the QR code available at the counter. (2) By email — contact library@swinburne.edu.my and the library will send you a QR code for payment.',
        steps: [],
      } satisfies FaqAssistantResponse);
    }
    if (isDue) {
      return NextResponse.json({
        kind: 'answer',
        reply: 'Students can borrow up to 10 general-collection items for 14 days, with a 7-day renewal. Staff collection items are overnight loans only (no renewal). Reference items are 3 days with no renewal. Your due date is shown at checkout and listed under Active Loans on your dashboard. Check the Notifications page for upcoming reminders.',
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
      reply: 'I am here to help! You can ask me how to borrow, return, or renew a book, about loan periods and fines, lost items, payments, or using the barcode scanner. What would you like to know?',
      steps: [],
    } satisfies FaqAssistantResponse);
  }

  const result = parseResponse(raw);
  return NextResponse.json(result);
}
