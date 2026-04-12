import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

export type AiPreferenceResult = {
  summary: string;
  interests: string[];
  followUpQuestion: string;
};

const DEFAULT_FOLLOW_UP = 'Any authors or series you already like?';

type Provider = 'gemini' | 'ollama';

let geminiDisabled = false;
let geminiDisabledReason: string | null = null;
let ollamaDisabled = false;

const getEnv = () => ({
  provider: (process.env.LLM_PROVIDER?.trim().toLowerCase() as Provider | undefined) ?? undefined,
  geminiBaseUrl:
    process.env.GEMINI_API_BASE_URL?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL?.trim() || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL?.trim() || 'gemma4',
});

const safeJsonParse = (content: string): AiPreferenceResult | null => {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as AiPreferenceResult;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as AiPreferenceResult;
    } catch {
      return null;
    }
  }
};

const buildFallback = (message: string): AiPreferenceResult => {
  const tokens = tokenizeInterests(message);
  const interests = tokens.slice(0, 6);
  const summary = interests.length
    ? `Interests: ${interests.join(', ')}`
    : 'Interests captured from your message';
  return {
    summary,
    interests,
    followUpQuestion: DEFAULT_FOLLOW_UP,
  };
};

const GEMINI_BASE_SYSTEM_PROMPT =
  'You are a library recommender. Extract reading preferences and return ONLY valid JSON with keys: summary (string), interests (array of 3-8 short tokens that are CLOSELY related to what the user said — do NOT add unrelated domains), followUpQuestion (short book-specific question). If the user says a single word like "art", interests must stay within that topic only. Use English only. No extra text. No markdown. Output JSON only.';

const buildGeminiSystemPrompt = (
  userContext?: { historyTags?: string[]; savedInterests?: string[] },
): string => {
  const history = userContext?.historyTags ?? [];
  const saved = userContext?.savedInterests ?? [];
  
  let allContext: string[] = [];
  let sourceLabel = 'engaged with these topics';

  if (history.length > 0) {
    allContext = history.slice(0, 8);
    sourceLabel = 'borrowed books related to these topics';
  } else if (saved.length > 0) {
    allContext = saved.slice(0, 8);
    sourceLabel = 'selected these topics as their primary interests';
  }

  if (!allContext.length) return GEMINI_BASE_SYSTEM_PROMPT;

  return (
    GEMINI_BASE_SYSTEM_PROMPT +
    `\n\nThis user has previously ${sourceLabel}: ${allContext.join(', ')}. ` +
    'Use this to bias the interests array toward related topics, but still honour what they say in the current message. ' +
    'If the current message is unrelated to their history, extract interests from the message alone.'
  );
};
// ---------------------------------------------------------------------------
// Ollama integration
// ---------------------------------------------------------------------------

type OllamaMessage = { role: 'system' | 'user' | 'assistant'; content: string };

const callOllamaChat = async (
  messages: OllamaMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string | null> => {
  if (ollamaDisabled) return null;
  const { ollamaBaseUrl, ollamaModel } = getEnv();

  const url = `${ollamaBaseUrl.replace(/\/+$/, '')}/api/chat`;
  const body = {
    model: ollamaModel,
    messages,
    stream: false,
    options: {
      temperature: options?.temperature ?? 0.2,
      ...(options?.maxTokens ? { num_predict: options.maxTokens } : {}),
    },
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[Ollama] Connection failed — is Ollama running?', err);
    ollamaDisabled = true;
    return null;
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    console.error('[Ollama] API error', response.status, errText);
    if (response.status >= 500) ollamaDisabled = true;
    return null;
  }

  const data = (await response.json()) as {
    message?: { content?: string };
  };

  return data?.message?.content?.trim() || null;
};

const extractWithOllama = async (
  message: string,
  userContext?: { historyTags?: string[]; savedInterests?: string[] },
): Promise<AiPreferenceResult | null> => {
  const systemPrompt = buildGeminiSystemPrompt(userContext);
  const text = await callOllamaChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    { temperature: 0.1, maxTokens: 120 }, // JSON reply is tiny — cap tokens for speed
  );
  if (!text) return null;
  const parsed = safeJsonParse(text);
  if (!parsed) {
    console.error('[Ollama] Non-JSON response for preference extraction');
    return null;
  }
  return parsed;
};

// ---------------------------------------------------------------------------

const GEMINI_CHAT_PROMPT =
  'You are a helpful study assistant for a university library. You may answer ONLY about programming, software, computing, math, data, and language learning (English, grammar, writing). Be concise, friendly, and safe. If the user asks about religion, politics, credentials/secrets, the AI model identity, or NSFW content, refuse briefly and redirect to safe study topics. Use English only.';

const localChatFallback = (message: string): string | null => {
  const input = message.trim().toLowerCase();
  const canned: Array<{ pattern: RegExp; reply: string }> = [
    {
      pattern: /\bwhat\s+is\s+coding\b/i,
      reply:
        'Coding is writing instructions that tell a computer what to do. It involves using a programming language to solve problems or build software.',
    },
    {
      pattern: /\bcode\b/i,
      reply:
        'In programming, code is a set of instructions written in a language like Python, JavaScript, or C++ to make a computer perform tasks.',
    },
    {
      pattern: /\bwhat\s+is\s+programming\b/i,
      reply:
        'Programming is the process of designing and writing code to create software or automate tasks. It includes planning, coding, testing, and fixing bugs.',
    },
    {
      pattern: /\bwhat\s+is\s+python\b/i,
      reply:
        'Python is a popular, beginner-friendly programming language used for web apps, data analysis, automation, and AI.',
    },
    {
      pattern: /c\+\+/i,
      reply:
        'C++ is a fast, compiled programming language used for systems, games, and performance-critical software.',
    },
    {
      pattern: /\bjava(script)?\b/i,
      reply:
        'JavaScript is the language of the web. It runs in browsers to add interactivity and can also run on servers (Node.js).',
    },
    {
      pattern: /\bhtml\b/i,
      reply:
        'HTML structures web pages. It defines headings, paragraphs, links, images, and other page content.',
    },
    {
      pattern: /\bcss\b/i,
      reply:
        'CSS styles web pages. It controls colors, fonts, spacing, layout, and responsiveness.',
    },
    {
      pattern: /\bwhat\s+is\s+algorithm\b/i,
      reply:
        'An algorithm is a step-by-step set of instructions for solving a problem or performing a task.',
    },
    {
      pattern: /\boperating\s+system\b/i,
      reply:
        'An operating system (OS) manages a computer’s hardware and provides services for applications. Examples include Windows, macOS, and Linux.',
    },
  ];

  for (const item of canned) {
    if (item.pattern.test(input)) return item.reply;
  }

  return null;
};

const extractWithGemini = async (
  message: string,
  userContext?: { historyTags?: string[]; savedInterests?: string[] },
) => {
  const { geminiBaseUrl, geminiApiKey, geminiModel } = getEnv();
  if (!geminiApiKey || !geminiModel) return null;
  if (geminiDisabled) return null;

  const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(
    geminiModel,
  )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: buildGeminiSystemPrompt(userContext) },
          { text: message },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch {
      errorText = '';
    }
    if (response.status === 403) {
      geminiDisabled = true;
      geminiDisabledReason = errorText || 'Gemini API key rejected (403).';
      console.error('Gemini API disabled:', geminiDisabledReason);
      return null;
    }
    console.error('Gemini API error', response.status, errorText);
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('') ?? '';

  if (!text.trim()) return null;
  const parsed = safeJsonParse(text);
  if (!parsed) {
    console.error('Gemini API returned non-JSON content');
  }
  return parsed;
};

const normalisePreference = (raw: AiPreferenceResult, message: string): AiPreferenceResult => ({
  summary: raw.summary?.toString().trim() || buildFallback(message).summary,
  interests:
    Array.isArray(raw.interests) && raw.interests.length
      ? raw.interests.map((v) => String(v).trim()).filter(Boolean)
      : buildFallback(message).interests,
  followUpQuestion: raw.followUpQuestion?.toString().trim() || DEFAULT_FOLLOW_UP,
});

export async function extractPreferences(
  message: string,
  userContext?: { historyTags?: string[]; savedInterests?: string[] },
): Promise<AiPreferenceResult> {
  const { provider, geminiApiKey } = getEnv();

  // 1. Try Ollama (local) when configured
  if (provider === 'ollama') {
    try {
      const ollamaResult = await extractWithOllama(message, userContext);
      if (ollamaResult) return normalisePreference(ollamaResult, message);
    } catch {
      // fall through to Gemini / fallback
    }
  }

  // 2. Try Gemini (cloud)
  if (provider === 'gemini' || geminiApiKey) {
    try {
      const geminiResult = await extractWithGemini(message, userContext);
      if (geminiResult) return normalisePreference(geminiResult, message);
    } catch {
      return buildFallback(message);
    }
  }

  return buildFallback(message);
}

export type LinkedInCourseSuggestion = {
  title: string;
  query: string;
};

const GEMINI_LINKEDIN_PROMPT =
  'You are a library assistant. Given a list of reading interests, suggest exactly 3 LinkedIn Learning course titles that complement those topics. Return ONLY valid JSON with key: courses (array of objects, each with title (string) and query (string — the search keywords to use on LinkedIn Learning)). Keep titles concise and realistic. Use English only. No extra text.';

const parseLinkedInCourses = (text: string): LinkedInCourseSuggestion[] => {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  let parsed: { courses?: Array<{ title?: string; query?: string }> } | null = null;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { return []; }
    }
  }
  if (!parsed || !Array.isArray(parsed.courses)) return [];
  return parsed.courses
    .filter((c) => c.title && c.query)
    .map((c) => ({ title: c.title!.trim(), query: c.query!.trim() }))
    .slice(0, 3);
};

export async function suggestLinkedInCourses(
  interests: string[],
): Promise<LinkedInCourseSuggestion[]> {
  if (!interests.length) return [];
  const { provider, geminiApiKey, geminiBaseUrl, geminiModel } = getEnv();

  // When using Ollama, skip the local LLM for LinkedIn suggestions (slow second call).
  // Fall through to Gemini if a key is available, otherwise return empty.

  // Try Gemini
  if (!geminiApiKey || !geminiModel || geminiDisabled) return [];

  try {
    const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: GEMINI_LINKEDIN_PROMPT },
            { text: `Interests: ${interests.join(', ')}` },
          ],
        },
      ],
      generationConfig: { temperature: 0.4 },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('[LinkedIn suggestions] Gemini API error', response.status, errText);
      return [];
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
    if (!text.trim()) return [];
    return parseLinkedInCourses(text);
  } catch {
    return [];
  }
}

export async function answerQuestion(message: string): Promise<string | null> {
  const { provider, geminiApiKey } = getEnv();
  const localFallback = localChatFallback(message);

  // 1. Try Ollama (local)
  if (provider === 'ollama') {
    try {
      const answer = await callOllamaChat([
        { role: 'system', content: GEMINI_CHAT_PROMPT },
        { role: 'user', content: message },
      ], { temperature: 0.2, maxTokens: 220 });
      if (answer) return answer;
    } catch {
      // fall through
    }
  }

  if (geminiDisabled) {
    return localFallback;
  }

  // 2. Try Gemini (cloud)
  if (provider === 'gemini' || geminiApiKey) {
    try {
      const { geminiBaseUrl, geminiModel } = getEnv();
      if (!geminiApiKey || !geminiModel) return localFallback;

      const url = `${geminiBaseUrl.replace(/\/+$/, '')}/models/${encodeURIComponent(
        geminiModel,
      )}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;

      const body = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: GEMINI_CHAT_PROMPT },
              { text: message },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 220,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {
          errorText = '';
        }
        if (response.status === 403) {
          geminiDisabled = true;
          geminiDisabledReason = errorText || 'Gemini API key rejected (403).';
          console.error('Gemini API disabled:', geminiDisabledReason);
          return null;
        }
        console.error('Gemini API error', response.status, errorText);
        return null;
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? '')
          .join('') ?? '';

      return text.trim() || localFallback;
    } catch {
      return localFallback;
    }
  }

  return localFallback;
}
