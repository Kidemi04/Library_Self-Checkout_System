import { searchLinkedInLearningCourses } from '@/app/lib/linkedin/service';
import type { UserContext } from '@/app/lib/recommendations/user-context';
import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

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
  url?: string | null;
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
- For "find_books" or "both": searchTerms should be 3-8 short topic keywords useful for searching a library catalog. Empty array otherwise.
- For "answer" or "both": give a concise, clear academic explanation in reply (2-4 sentences max).
- For "greeting": reply warmly and invite the student to ask for books or academic help.
- For "off_topic": politely decline and redirect to books or academic topics.
- You can answer questions from ALL academic fields: computer science, business, engineering, art, mathematics, science, humanities, etc.
- Never reveal what AI model you are. You are the library assistant.
- Current year: ${currentYear}.${studentCtx}

Prioritize book search terms that match the student's faculty and department when relevant.`;
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

  if (resolved === 'lmstudio') {
    return callLMStudio(systemPrompt, userMessage, options);
  }

  if (resolved === 'gemini' || geminiApiKey) {
    const result = await callGemini(systemPrompt, userMessage, {
      temperature: options?.temperature,
      maxOutputTokens: options?.maxTokens,
    });
    if (result) return result;
  }

  // Fallback to LM Studio if Gemini fails
  return callLMStudio(systemPrompt, userMessage, options);
};

// ─── Fallback when AI is unavailable ─────────────────────────────────────────

const buildFallbackResult = (message: string): AiResult => {
  const tokens = tokenizeInterests(message);
  return {
    intent: 'find_books',
    reply: 'Let me search the catalog based on your interests.',
    searchTerms: tokens.slice(0, 6),
    followUpQuestion: 'Any authors or topics you already enjoy?',
  };
};

// ─── Main unified AI call ─────────────────────────────────────────────────────

export async function classifyAndExtract(
  message: string,
  userContext?: UserContext,
  providerOverride?: 'lmstudio' | 'gemini',
): Promise<AiResult> {
  try {
    const systemPrompt = buildUnifiedSystemPrompt(userContext);
    const raw = await callAI(systemPrompt, message, { temperature: 0.3, maxTokens: 512 }, providerOverride);

    if (!raw) return buildFallbackResult(message);

    const jsonStr = extractJson(raw);
    let parsed: Partial<AiResult> | null = null;

    try {
      parsed = JSON.parse(jsonStr) as Partial<AiResult>;
    } catch {
      console.error('[AI] JSON parse failed:', jsonStr);
      return buildFallbackResult(message);
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
      ? parsed.searchTerms.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)
      : [];

    const followUpQuestion =
      typeof parsed.followUpQuestion === 'string' ? parsed.followUpQuestion.trim() : '';

    return { intent, reply, searchTerms, followUpQuestion };
  } catch {
    return buildFallbackResult(message);
  }
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

    const baseSuggestions = parsed.courses
      .filter((c) => c.title && c.query)
      .map((c) => ({ title: c.title!.trim(), query: c.query!.trim() }))
      .slice(0, 3);

    if (!baseSuggestions.length) return [];

    const enriched = await Promise.all(
      baseSuggestions.map(async (suggestion) => {
        try {
          const result = await searchLinkedInLearningCourses({
            query: suggestion.query,
            limit: 1,
          });
          const asset = result.items[0];
          if (asset) {
            return {
              title: asset.title || suggestion.title,
              query: suggestion.query,
              url: asset.url ?? null,
            };
          }
        } catch {
          // Fall back to the AI suggestion.
        }

        return suggestion;
      }),
    );

    return enriched;
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
