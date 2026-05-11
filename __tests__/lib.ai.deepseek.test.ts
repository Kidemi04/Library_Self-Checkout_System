/** @jest-environment node */

const fetchMock = jest.fn();
(global as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

beforeEach(() => {
  fetchMock.mockReset();
  process.env.DEEPSEEK_API_KEY = 'test-key';
  process.env.DEEPSEEK_MODEL = 'deepseek-v4-flash';
  process.env.DEEPSEEK_API_BASE_URL = 'https://example.test';
  process.env.DEEPSEEK_TIMEOUT_MS = '50';
  jest.resetModules();
});

const chatResponse = (content: string) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content } }] }),
    text: () => Promise.resolve(content),
  } as unknown as Response);

test('callDeepSeekJson posts to /chat/completions with json mode and parses the content', async () => {
  fetchMock.mockReturnValueOnce(chatResponse('{"intent":"greeting"}'));
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');

  const result = await callDeepSeekJson('sys', 'hello', { maxTokens: 64 });

  expect(result).toEqual({ ok: true, data: { intent: 'greeting' } });
  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe('https://example.test/chat/completions');
  const body = JSON.parse((init as RequestInit).body as string);
  expect(body.model).toBe('deepseek-v4-flash');
  expect(body.response_format).toEqual({ type: 'json_object' });
  expect(body.stream).toBe(false);
  expect(body.messages).toEqual([
    { role: 'system', content: 'sys' },
    { role: 'user', content: 'hello' },
  ]);
  expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer test-key' });
});

test('callDeepSeekJson classifies a 429 as rate_limit', async () => {
  fetchMock.mockReturnValueOnce(
    Promise.resolve({ ok: false, status: 429, text: () => Promise.resolve('slow down') } as unknown as Response),
  );
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'rate_limit' });
});

test('callDeepSeekJson classifies a 401 as auth', async () => {
  fetchMock.mockReturnValueOnce(
    Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve('bad key') } as unknown as Response),
  );
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'auth' });
});

test('callDeepSeekJson classifies a 403 as auth', async () => {
  fetchMock.mockReturnValueOnce(
    Promise.resolve({ ok: false, status: 403, text: () => Promise.resolve('forbidden') } as unknown as Response),
  );
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'auth' });
});

test('callDeepSeekJson classifies a 500 as server', async () => {
  fetchMock.mockReturnValueOnce(
    Promise.resolve({ ok: false, status: 503, text: () => Promise.resolve('oops') } as unknown as Response),
  );
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'server' });
});

test('callDeepSeekJson classifies unparseable content as bad_response', async () => {
  fetchMock.mockReturnValueOnce(chatResponse('not json at all'));
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'bad_response' });
});

test('callDeepSeekJson classifies an aborted/slow request as timeout', async () => {
  fetchMock.mockImplementationOnce((_url: string, init: RequestInit) => {
    return new Promise((_resolve, reject) => {
      const signal = init.signal as AbortSignal;
      signal.addEventListener('abort', () => {
        const err = new Error('aborted');
        err.name = 'AbortError';
        reject(err);
      });
    });
  });
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'timeout' });
});

test('callDeepSeekJson returns auth when the key is missing', async () => {
  delete process.env.DEEPSEEK_API_KEY;
  jest.resetModules();
  const { callDeepSeekJson } = await import('@/app/lib/ai/deepseek');
  expect(await callDeepSeekJson('s', 'u')).toEqual({ ok: false, kind: 'auth' });
  expect(fetchMock).not.toHaveBeenCalled();
});
