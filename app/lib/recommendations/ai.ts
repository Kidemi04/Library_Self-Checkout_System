import type { UserContext } from '@/app/lib/recommendations/user-context';
import { tokenizeInterests, expandAcronyms } from '@/app/lib/recommendations/recommender';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiIntent = 'find_books' | 'answer' | 'both' | 'greeting' | 'off_topic';

export type AiResult = {
  intent: AiIntent;
  reply: string;
  searchTerms: string[];
  followUpQuestion: string;
};

export type LinkedInCourseSuggestion = {
  title: string;
  query: string;
};

// ─── Faculty → Book Category mapping ─────────────────────────────────────────

const FACULTY_CATEGORY_MAP: Record<string, string> = {
  'information technology': 'Computer Science',
  'computer science': 'Computer Science',
  'computing': 'Computer Science',
  'software engineering': 'Computer Science',
  'it': 'Computer Science',
  'business': 'Business',
  'business administration': 'Business',
  'management': 'Business',
  'accounting': 'Business',
  'finance': 'Business',
  'marketing': 'Business',
  'engineering': 'Engineering',
  'electrical engineering': 'Engineering',
  'mechanical engineering': 'Engineering',
  'civil engineering': 'Engineering',
  'art': 'Art & Design',
  'design': 'Art & Design',
  'art & design': 'Art & Design',
  'multimedia': 'Art & Design',
  'creative media': 'Art & Design',
};

export function facultyToCategory(faculty: string | null): string | null {
  if (!faculty) return null;
  return FACULTY_CATEGORY_MAP[faculty.toLowerCase()] ?? null;
}

// ─── Personalized request detection ──────────────────────────────────────────

const PERSONALIZED_PATTERNS = [
  /\bbased\s+on\s+(my|the)\b/i,
  /\bfor\s+me\b/i,
  /\bpersonali[sz]ed?\b/i,
  /\bmy\s+(faculty|interest|interests|profile|history|borrow|borrows|borrowing|reading|loans?|preferences?)\b/i,
  /\b(use|using)\s+my\b/i,
  /\brecommend\s+(me\s+)?(some\s+)?books?\s+(for|to)\s+me\b/i,
];

export const isPersonalizedRequest = (message: string): boolean =>
  PERSONALIZED_PATTERNS.some((p) => p.test(message));

const ASSIGNMENT_PATTERNS = [
  /\b(assignment|coursework|homework|essay|research\s+paper|thesis|dissertation)\b/i,
  /\bfor\s+my\s+(class|course|subject|module|assignment|project)\b/i,
  /\bacademic\s+(assignment|work|project)\b/i,
];

const AVAILABLE_PATTERNS = [
  /\bwhat'?s?\s+(books?\s+)?available\b/i,
  /\bavailable\s+(now|right\s+now|to\s+borrow|today)\b/i,
  /\bcan\s+i\s+borrow\s+(now|today|right\s+now)\b/i,
  /\bin\s+stock\b/i,
  /\bbooks?\s+i\s+can\s+borrow\s+(now|right\s+now|today)\b/i,
];

const INTERESTING_PATTERNS = [
  /\bsomething\s+(interesting|cool|fun|new|good|nice)\b/i,
  /\bsurprise\s+me\b/i,
  /\b(suggest|recommend)\s+something\b/i,
];

export type PresetIntent = 'personalized' | 'assignment' | 'available' | 'interesting';

export const detectPresetIntent = (message: string): PresetIntent | null => {
  if (ASSIGNMENT_PATTERNS.some((p) => p.test(message))) return 'assignment';
  if (AVAILABLE_PATTERNS.some((p) => p.test(message))) return 'available';
  if (INTERESTING_PATTERNS.some((p) => p.test(message))) return 'interesting';
  if (isPersonalizedRequest(message)) return 'personalized';
  return null;
};

export type PersonalizedSuggestion = {
  searchTerms: string[];
  reply: string;
  hasContext: boolean;
  kind: PresetIntent;
};

export const buildPersonalizedSuggestion = (
  userContext: UserContext,
  kind: PresetIntent = 'personalized',
): PersonalizedSuggestion => {
  const searchTerms: string[] = [];
  const reasonParts: string[] = [];

  if (userContext.faculty) {
    const cat = facultyToCategory(userContext.faculty);
    if (cat) searchTerms.push(cat.toLowerCase());
    reasonParts.push(`your faculty in ${userContext.faculty}`);
  }

  if (userContext.savedInterests?.length) {
    const interests = userContext.savedInterests.slice(0, 4);
    searchTerms.push(...interests);
    reasonParts.push(`your saved interests (${interests.slice(0, 3).join(', ')})`);
  }

  if (userContext.historyTags?.length) {
    const histTags = userContext.historyTags.slice(0, 4);
    searchTerms.push(...histTags);
    if (!userContext.savedInterests?.length) {
      reasonParts.push(`topics from your past loans (${histTags.slice(0, 3).join(', ')})`);
    }
  }

  if (userContext.recentBorrowedBooks?.length) {
    const top2 = userContext.recentBorrowedBooks.slice(0, 2);
    const titles = top2.map((b) => `"${b.title}"`).join(' and ');
    reasonParts.push(`your recent ${top2.length > 1 ? 'borrows' : 'borrow'} of ${titles}`);
  }

  const dedupedTerms = [...new Set(searchTerms.map((t) => t.toLowerCase().trim()).filter(Boolean))].slice(0, 6);

  if (reasonParts.length === 0) {
    if (kind === 'available') {
      return {
        kind,
        searchTerms: [],
        reply: 'Here are some books currently available to borrow from our catalog.',
        hasContext: false,
      };
    }
    const noCtxReply =
      kind === 'assignment'
        ? 'I do not see any faculty or coursework info on your profile yet. Could you tell me what subject your assignment is on so I can suggest relevant books?'
        : kind === 'interesting'
          ? 'I do not have any reading history for you yet. Could you tell me what topics or subjects catch your interest?'
          : 'I do not have any borrow history or profile info for you yet. Could you tell me what topics or subjects you are interested in so I can suggest something?';
    return { kind, searchTerms: [], reply: noCtxReply, hasContext: false };
  }

  const reasonText = reasonParts.join(' and ');
  let reply: string;
  switch (kind) {
    case 'assignment':
      reply = `For your academic assignment, based on ${reasonText}, here are books that should support your coursework.`;
      break;
    case 'available':
      reply = `Here are currently available books that match ${reasonText}.`;
      break;
    case 'interesting':
      reply = `Here is something you might enjoy reading, picked based on ${reasonText}.`;
      break;
    case 'personalized':
    default:
      reply = `Based on ${reasonText}, here are some books you might enjoy.`;
      break;
  }

  return { kind, searchTerms: dedupedTerms, reply, hasContext: true };
};

// ─── Env ──────────────────────────────────────────────────────────────────────

type Provider = 'gemini' | 'lmstudio';

let geminiDisabled = false;

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

// ─── JSON helpers ─────────────────────────────────────────────────────────────

const stripMarkdown = (text: string): string =>
  text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const extractJson = (raw: string): string => {
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
};

// ─── Build student context string for prompts ─────────────────────────────────

const buildStudentContext = (userContext?: UserContext): string => {
  if (!userContext) return '';

  const parts: string[] = [];

  if (userContext.faculty) parts.push(`Faculty: ${userContext.faculty}`);
  if (userContext.department) parts.push(`Department: ${userContext.department}`);

  if (userContext.intakeYear) {
    const studyYear = new Date().getFullYear() - userContext.intakeYear + 1;
    const clampedYear = Math.min(Math.max(studyYear, 1), 4);
    parts.push(`Study year: Year ${clampedYear}`);
  }

  const allInterests = [
    ...new Set([...userContext.historyTags, ...userContext.savedInterests]),
  ].slice(0, 12);
  if (allInterests.length) parts.push(`Known interests: ${allInterests.join(', ')}`);

  const recent = userContext.recentBorrowedBooks ?? [];
  if (recent.length) {
    const lines = recent.slice(0, 8).map((b) => {
      const author = b.author ? ` — ${b.author}` : '';
      return `- "${b.title}"${author}`;
    });
    parts.push(`Recently borrowed books (most recent first):\n${lines.join('\n')}`);
  }

  return parts.length ? `\n\nStudent profile:\n${parts.join('\n')}` : '';
};

// ─── System prompts ───────────────────────────────────────────────────────────

const buildUnifiedSystemPrompt = (userContext?: UserContext): string => {
  const studentCtx = buildStudentContext(userContext);
  const currentYear = new Date().getFullYear();

  return `You are a helpful university library assistant. Your job is to help students find books and answer academic questions.

You must respond ONLY with a valid JSON object — no markdown, no extra text, no code fences.

Classify the student's message into one of these intents:
- "find_books": student wants book recommendations (e.g. "recommend books on marketing", "I need books for my data science assignment")
- "answer": student has an academic question (e.g. "what is machine learning?", "explain supply and demand")
- "both": student asks a question AND wants books (e.g. "what is blockchain and can you recommend books?")
- "greeting": hi, hello, how are you, or other small talk
- "off_topic": requests unrelated to studying or books (e.g. write my essay, personal advice, harmful content)

Response format:
{
  "intent": "find_books" | "answer" | "both" | "greeting" | "off_topic",
  "reply": "Your natural, friendly response. Plain text only — no asterisks, no bullet points, no markdown.",
  "searchTerms": ["term1", "term2"],
  "followUpQuestion": "One short follow-up question (only for find_books or both, else empty string)"
}

Rules:
- reply must always be plain text. Never use **bold**, *italic*, bullet points, or markdown.
- For "find_books" or "both": searchTerms must be the SUBJECT/TOPIC the student wants — proper noun phrases as they would appear in a book title or table of contents. NEVER include filler verbs (give, show, find, recommend, suggest, want), quantifiers (some, any, a few), or pronouns (me, my). Expand acronyms to their full form (AI → "artificial intelligence", ML → "machine learning", DB → "database", OOP → "object-oriented programming"). Use 2-6 multi-word phrases when possible.
- Examples:
  • "give me some AI books" → searchTerms: ["artificial intelligence", "machine learning", "neural networks"]
  • "I need books for my marketing assignment" → searchTerms: ["marketing strategy", "consumer behavior", "brand management"]
  • "recommend something on databases" → searchTerms: ["database systems", "SQL", "relational databases"]
  • "show me good react books" → searchTerms: ["React", "frontend development", "JavaScript frameworks"]
- For "answer" or "both": give a concise, clear academic explanation in reply (2-4 sentences max).
- For "greeting": reply warmly and invite the student to ask for books or academic help.
- For "off_topic": politely decline and redirect to books or academic topics.
- You can answer questions from ALL academic fields: computer science, business, engineering, art, mathematics, science, humanities, etc.
- Never reveal what AI model you are. You are the library assistant.
- Current year: ${currentYear}.${studentCtx}

Prioritize book search terms that match the student's faculty and department when relevant.
When the student asks for recommendations without specifying a topic (e.g. "suggest me a book", "what should I read next"), infer topics from their recently borrowed books and known interests above, and use those as searchTerms. Mention the connection naturally in reply (e.g. "Since you've been reading about X, here are related books on Y").
Never recommend a book they have already borrowed recently — pick adjacent or follow-up topics instead.`;
};

const LINKEDIN_SYSTEM_PROMPT = `You are a university library assistant. Given a student's reading interests, suggest exactly 3 LinkedIn Learning course titles that complement those topics.
Return ONLY valid JSON — no markdown, no code fences, no extra text.
Format: { "courses": [{ "title": "...", "query": "..." }, ...] }
Keep titles concise and realistic. Use English only.`;

// ─── LM Studio (OpenAI-compatible) ───────────────────────────────────────────

const callLMStudio = async (
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string | null> => {
  const { lmstudioBaseUrl, lmstudioModel } = getEnv();

  try {
    const response = await fetch(`${lmstudioBaseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: lmstudioModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 512,
        stream: false,
        reasoning: { effort: 'none' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[LM Studio] API error', response.status, errText);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error('[LM Studio] fetch error', err);
    return null;
  }
};

// ─── Gemini ───────────────────────────────────────────────────────────────────

const callGemini = async (
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<string | null> => {
  const { geminiBaseUrl, geminiApiKey, geminiModel } = getEnv();
  if (!geminiApiKey || !geminiModel || geminiDisabled) return null;

  const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(
    geminiModel,
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }, { text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      ...(options?.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 403) {
        geminiDisabled = true;
        console.error('Gemini API disabled:', errorText);
        return null;
      }
      console.error('Gemini API error', response.status, errorText);
      return null;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return (
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim() ?? null
    );
  } catch (err) {
    console.error('[Gemini] fetch error', err);
    return null;
  }
};

// ─── Provider router ──────────────────────────────────────────────────────────

const callAI = async (
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<string | null> => {
  const { provider, geminiApiKey } = getEnv();
  const resolved = providerOverride ?? provider;

  // Explicit provider choice from the UI → stick to that one, no silent fallback.
  if (resolved === 'lmstudio') {
    return callLMStudio(systemPrompt, userMessage, options);
  }
  if (resolved === 'gemini') {
    return callGemini(systemPrompt, userMessage, {
      temperature: options?.temperature,
      maxOutputTokens: options?.maxTokens,
    });
  }

  // No explicit override → auto-pick: prefer Gemini when key is present, else LM Studio.
  if (geminiApiKey) {
    const result = await callGemini(systemPrompt, userMessage, {
      temperature: options?.temperature,
      maxOutputTokens: options?.maxTokens,
    });
    if (result) return result;
  }
  return callLMStudio(systemPrompt, userMessage, options);
};

// ─── AI unavailable error ────────────────────────────────────────────────────

export class AiUnavailableError extends Error {
  constructor(message = 'AI service unavailable') {
    super(message);
    this.name = 'AiUnavailableError';
  }
}

// ─── AI health check ─────────────────────────────────────────────────────────
// Used to guard every recommendation request. Result is cached briefly so we
// don't make an extra ping on every single request.

type HealthCacheEntry = { healthy: boolean; checkedAt: number };
const aiHealthCache = new Map<string, HealthCacheEntry>();
const AI_HEALTH_CACHE_MS = 15_000;

export async function checkAiAvailable(
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<boolean> {
  const key = providerOverride ?? 'auto';
  const now = Date.now();
  const cached = aiHealthCache.get(key);
  if (cached && now - cached.checkedAt < AI_HEALTH_CACHE_MS) {
    return cached.healthy;
  }

  const raw = await callAI(
    'Respond with only the single word: ok',
    'ping',
    { temperature: 0, maxTokens: 4 },
    providerOverride,
  );
  const healthy = Boolean(raw && raw.trim().length);
  aiHealthCache.set(key, { healthy, checkedAt: now });
  return healthy;
}

// ─── Main unified AI call ─────────────────────────────────────────────────────

export async function classifyAndExtract(
  message: string,
  userContext?: UserContext,
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<AiResult> {
  const systemPrompt = buildUnifiedSystemPrompt(userContext);
  const raw = await callAI(systemPrompt, message, { temperature: 0.3, maxTokens: 512 }, providerOverride);

  if (!raw) throw new AiUnavailableError();

  const jsonStr = extractJson(raw);
  let parsed: Partial<AiResult> | null = null;

  try {
    parsed = JSON.parse(jsonStr) as Partial<AiResult>;
  } catch {
    console.error('[AI] JSON parse failed:', jsonStr);
    throw new AiUnavailableError('AI returned invalid response');
  }

  const intent: AiIntent =
    ['find_books', 'answer', 'both', 'greeting', 'off_topic'].includes(parsed.intent as string)
      ? (parsed.intent as AiIntent)
      : 'find_books';

  const reply = stripMarkdown(
    typeof parsed.reply === 'string' && parsed.reply.trim()
      ? parsed.reply.trim()
      : 'Here are some books that might help you.',
  );

  const searchTerms = Array.isArray(parsed.searchTerms)
    ? expandAcronyms(parsed.searchTerms.map((t) => String(t).trim()).filter(Boolean)).slice(0, 8)
    : [];

  const followUpQuestion =
    typeof parsed.followUpQuestion === 'string' ? parsed.followUpQuestion.trim() : '';

  return { intent, reply, searchTerms, followUpQuestion };
}

// ─── LinkedIn course suggestions ──────────────────────────────────────────────

export async function suggestLinkedInCourses(
  interests: string[],
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<LinkedInCourseSuggestion[]> {
  if (!interests.length) return [];

  try {
    const raw = await callAI(
      LINKEDIN_SYSTEM_PROMPT,
      `Student interests: ${interests.join(', ')}`,
      { temperature: 0.4, maxTokens: 256 },
      providerOverride,
    );
    if (!raw) return [];

    const jsonStr = extractJson(raw);
    let parsed: { courses?: Array<{ title?: string; query?: string }> } | null = null;

    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return [];
    }

    if (!parsed || !Array.isArray(parsed.courses)) return [];
    return parsed.courses
      .filter((c) => c.title && c.query)
      .map((c) => ({ title: c.title!.trim(), query: c.query!.trim() }))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Legacy exports (kept for compatibility) ──────────────────────────────────

export type AiPreferenceResult = {
  summary: string;
  interests: string[];
  followUpQuestion: string;
};

export async function extractPreferences(
  message: string,
  userContext?: UserContext,
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<AiPreferenceResult> {
  const result = await classifyAndExtract(message, userContext, providerOverride);
  return {
    summary: result.reply,
    interests: result.searchTerms.length ? result.searchTerms : tokenizeInterests(message).slice(0, 6),
    followUpQuestion: result.followUpQuestion || 'Any authors or series you already like?',
  };
}

export async function answerQuestion(
  message: string,
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<string | null> {
  const result = await classifyAndExtract(message, undefined, providerOverride);
  return result.reply || null;
}
