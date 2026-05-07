import { resolveInitialMode } from '@/app/dashboard/help/modeFromQuery';

describe('resolveInitialMode', () => {
  test('default is chat when no params', () => {
    expect(resolveInitialMode({})).toEqual({ mode: 'chat', topicSlug: null });
  });
  test('mode=chat', () => {
    expect(resolveInitialMode({ mode: 'chat' })).toEqual({ mode: 'chat', topicSlug: null });
  });
  test('mode=faq with topic', () => {
    expect(resolveInitialMode({ mode: 'faq', topic: 'returning-books' }))
      .toEqual({ mode: 'faq', topicSlug: 'returning-books' });
  });
  test('mode=faq without topic', () => {
    expect(resolveInitialMode({ mode: 'faq' })).toEqual({ mode: 'faq', topicSlug: null });
  });
  test('mode=find-book ignores topic', () => {
    expect(resolveInitialMode({ mode: 'find-book', topic: 'x' }))
      .toEqual({ mode: 'find-book', topicSlug: null });
  });
  test('invalid mode falls back to chat', () => {
    expect(resolveInitialMode({ mode: 'bogus' })).toEqual({ mode: 'chat', topicSlug: null });
  });
  test('array param values use first element', () => {
    expect(resolveInitialMode({ mode: ['faq', 'chat'], topic: ['returning-books'] }))
      .toEqual({ mode: 'faq', topicSlug: 'returning-books' });
  });
});
