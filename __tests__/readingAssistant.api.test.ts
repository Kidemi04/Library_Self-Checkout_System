/** @jest-environment node */

import { POST } from '@/app/api/reading-assistant/route';

const insertMock = jest.fn().mockResolvedValue({ error: null });
const fromMock = jest.fn(() => ({ insert: insertMock }));

const fetchBooksMock = jest.fn();
const classifyAndExtractMock = jest.fn();

jest.mock('@/app/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

jest.mock('@/auth', () => ({
  getSessionUser: jest.fn().mockResolvedValue({ id: 'user-uuid', email: 'a@b.com', role: 'user' }),
}));

jest.mock('@/app/lib/recommendations/ai.ts', () => ({
  classifyAndExtract: (...args: unknown[]) => classifyAndExtractMock(...args),
}));

jest.mock('@/app/lib/supabase/queries', () => ({
  fetchBooks: (...args: unknown[]) => fetchBooksMock(...args),
}));

beforeEach(() => {
  insertMock.mockClear();
  fromMock.mockClear();
  fetchBooksMock.mockReset();
  classifyAndExtractMock.mockReset();
});

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/reading-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

test('answer intent: returns reply, no books', async () => {
  classifyAndExtractMock.mockResolvedValue({
    intent: 'answer',
    reply: 'You can renew up to twice…',
    searchTerms: [],
    followUpQuestion: '',
  });
  const res = await POST(makeRequest({ message: 'how do I renew?' }));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.intent).toBe('answer');
  expect(body.reply).toMatch(/renew/);
  expect(body.books).toBeUndefined();
  expect(fetchBooksMock).not.toHaveBeenCalled();
  // persistence: 2 inserts (user msg + assistant msg)
  expect(insertMock).toHaveBeenCalledTimes(2);
});

test('find_books intent: returns reply + books', async () => {
  classifyAndExtractMock.mockResolvedValue({
    intent: 'find_books',
    reply: 'Here are some fantasy options:',
    searchTerms: ['fantasy'],
    followUpQuestion: '',
  });
  fetchBooksMock.mockResolvedValue([
    { id: 'b1', title: 'The Way of Kings', author: 'Brandon Sanderson', coverImageUrl: null, classification: 'Fantasy', isbn: '9780765326355' },
    { id: 'b2', title: 'Mistborn', author: 'Brandon Sanderson', coverImageUrl: null, classification: 'Fantasy', isbn: '9780765311788' },
  ]);
  const res = await POST(makeRequest({ message: 'find me a fantasy book' }));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.intent).toBe('find_books');
  expect(body.books).toHaveLength(2);
  expect(body.books[0].title).toBe('The Way of Kings');
  expect(fetchBooksMock).toHaveBeenCalled();
});

test('both intent: also returns books', async () => {
  classifyAndExtractMock.mockResolvedValue({
    intent: 'both',
    reply: 'You can renew, and meanwhile here are some sci-fi picks:',
    searchTerms: ['sci-fi'],
    followUpQuestion: '',
  });
  fetchBooksMock.mockResolvedValue([
    { id: 'b1', title: 'Dune', author: 'Frank Herbert', coverImageUrl: null, classification: 'Sci-Fi', isbn: '9780441172719' },
  ]);
  const res = await POST(makeRequest({ message: 'how do I renew? Also recommend sci-fi.' }));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.intent).toBe('both');
  expect(body.books).toHaveLength(1);
});

test('off_topic: returns reply, no books', async () => {
  classifyAndExtractMock.mockResolvedValue({
    intent: 'off_topic',
    reply: 'I can only help with library topics.',
    searchTerms: [],
    followUpQuestion: '',
  });
  const res = await POST(makeRequest({ message: 'tell me about quantum physics' }));
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.intent).toBe('off_topic');
  expect(body.books).toBeUndefined();
  expect(fetchBooksMock).not.toHaveBeenCalled();
});

test('rejects empty message', async () => {
  const res = await POST(makeRequest({ message: '   ' }));
  expect(res.status).toBe(400);
  expect(classifyAndExtractMock).not.toHaveBeenCalled();
});

test('rejects missing message', async () => {
  const res = await POST(makeRequest({}));
  expect(res.status).toBe(400);
});
