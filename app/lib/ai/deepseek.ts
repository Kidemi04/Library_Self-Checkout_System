// Low-level DeepSeek client. THE only place anything talks to a model.
// OpenAI-compatible Chat Completions at https://api.deepseek.com.
// Errors are classified and returned, never thrown raw — callers decide policy.

export type DeepSeekErrorKind = 'timeout' | 'rate_limit' | 'server' | 'auth' | 'bad_response';

export type DeepSeekJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; kind: DeepSeekErrorKind };

type ChatTurn = { role: 'system' | 'user' | 'assistant'; content: string };

const getEnv = () => ({
  baseUrl: (process.env.DEEPSEEK_API_BASE_URL?.trim() || 'https://api.deepseek.com').replace(/\/+$/, ''),
  apiKey: process.env.DEEPSEEK_API_KEY?.trim() || '',
  model: process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-v4-flash',
  timeoutJsonMs: Number(process.env.DEEPSEEK_TIMEOUT_MS) || 15000,
  timeoutStreamMs: Number(process.env.DEEPSEEK_STREAM_TIMEOUT_MS) || 30000,
});

function classifyHttpStatus(status: number): DeepSeekErrorKind {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate_limit';
  if (status >= 500) return 'server';
  return 'bad_response';
}

function classifyThrown(err: unknown): DeepSeekErrorKind {
  if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return 'timeout';
  return 'server';
}

export type DeepSeekHistoryTurn = { role: 'user' | 'assistant'; content: string };

export async function callDeepSeekJson(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number; history?: DeepSeekHistoryTurn[] },
): Promise<DeepSeekJsonResult> {
  const { baseUrl, apiKey, model, timeoutJsonMs } = getEnv();
  if (!apiKey) {
    console.error('[DeepSeek] DEEPSEEK_API_KEY is empty — env var not loaded. Check .env.local and restart pnpm dev.');
    return { ok: false, kind: 'auth' };
  }

  const messages: ChatTurn[] = [
    { role: 'system', content: systemPrompt },
    ...(options?.history ?? []).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutJsonMs);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: 'json_object' },
        temperature: options?.temperature ?? 0.3,
        ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const kind = classifyHttpStatus(response.status);
      const body = await response.text().catch(() => '');
      console.error(`[DeepSeek] non-ok ${response.status} (${kind}): ${body.slice(0, 300)}`);
      return { ok: false, kind };
    }

    const json = (await response.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: string } }> }
      | null;
    const content = json?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      console.error('[DeepSeek] 200 but empty content.');
      return { ok: false, kind: 'bad_response' };
    }
    try {
      return { ok: true, data: JSON.parse(content) as unknown };
    } catch {
      console.error('[DeepSeek] content was not valid JSON. Length:', content.length);
      return { ok: false, kind: 'bad_response' };
    }
  } catch (err) {
    const kind = classifyThrown(err);
    if (kind !== 'timeout') console.error('[DeepSeek] fetch error', err);
    return { ok: false, kind };
  } finally {
    clearTimeout(timer);
  }
}
