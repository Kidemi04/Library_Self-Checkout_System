type Mode = 'chat' | 'faq' | 'find-book';

export function resolveInitialMode(
  params: Record<string, string | string[] | undefined>,
): { mode: Mode; topicSlug: string | null } {
  const rawMode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const rawTopic = Array.isArray(params.topic) ? params.topic[0] : params.topic;

  const mode: Mode =
    rawMode === 'faq' || rawMode === 'find-book' || rawMode === 'chat' ? rawMode : 'chat';
  const topicSlug = mode === 'faq' && typeof rawTopic === 'string' ? rawTopic : null;
  return { mode, topicSlug };
}
