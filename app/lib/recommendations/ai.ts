import { tokenizeInterests } from '@/app/lib/recommendations/recommender';

export type AiPreferenceResult = {
  summary: string;
  interests: string[];
  followUpQuestion: string;
};

const DEFAULT_FOLLOW_UP = 'Any authors or series you already like?';

type Provider = 'gemini';

let geminiDisabled = false;
let geminiDisabledReason: string | null = null;

const getEnv = () => ({
  provider: (process.env.LLM_PROVIDER?.trim().toLowerCase() as Provider | undefined) ?? undefined,
  geminiBaseUrl:
    process.env.GEMINI_API_BASE_URL?.trim() ||
    'https://generativelanguage.googleapis.com/v1beta',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim(),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
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

const GEMINI_SYSTEM_PROMPT =
  'You are a library recommender. Extract reading preferences and return ONLY valid JSON with keys: summary (string), interests (array of 3-8 short tokens), followUpQuestion (short book-specific question). Use English only. No extra text.';
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

const extractWithGemini = async (message: string) => {
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
          { text: GEMINI_SYSTEM_PROMPT },
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

export async function extractPreferences(message: string): Promise<AiPreferenceResult> {
  const { provider, geminiApiKey } = getEnv();

  if (provider === 'gemini' || geminiApiKey) {
    try {
      const geminiResult = await extractWithGemini(message);
      if (geminiResult) {
        const interests =
          Array.isArray(geminiResult.interests) && geminiResult.interests.length
            ? geminiResult.interests.map((value) => String(value).trim()).filter(Boolean)
            : buildFallback(message).interests;

        return {
          summary: geminiResult.summary?.toString().trim() || buildFallback(message).summary,
          interests,
          followUpQuestion:
            geminiResult.followUpQuestion?.toString().trim() || DEFAULT_FOLLOW_UP,
        };
      }
    } catch {
      return buildFallback(message);
    }
  }

  return buildFallback(message);
}

export async function answerQuestion(message: string): Promise<string | null> {
  const { provider, geminiApiKey } = getEnv();
  const localFallback = localChatFallback(message);

  if (geminiDisabled) {
    return localFallback;
  }

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
