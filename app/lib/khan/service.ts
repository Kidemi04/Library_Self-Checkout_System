import type {
  LinkedInLearningAsset,
  LinkedInLearningSearchOptions,
  LinkedInLearningSearchResult,
  LinkedInLearningTopicCollection,
  LinkedInLearningTopicDefinition,
} from '@/app/lib/linkedin/types';
import { khanAcademyCourses } from './data';

export const searchKhanAcademyCourses = async (
  options: LinkedInLearningSearchOptions = {},
): Promise<LinkedInLearningSearchResult> => {
  const start = Date.now();

  const rawLimit = options.limit ?? 12;
  const limit = Math.min(Math.max(1, rawLimit), 30);
  const difficulty = options.difficulty ?? 'ALL';
  const query = (options.query ?? '').trim();

  let results: LinkedInLearningAsset[] = khanAcademyCourses;

  // Filter by difficulty
  if (difficulty !== 'ALL') {
    results = results.filter((course) => course.skillLevel === difficulty);
  }

  // Filter by query — all tokens must match title, description, or topics
  if (query.length > 0) {
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    results = results.filter((course) => {
      const haystack = [
        course.title,
        course.description ?? '',
        ...course.topics,
      ]
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => haystack.includes(token));
    });
  }

  const items = results.slice(0, limit);

  return {
    source: 'stub',
    query,
    tookMs: Date.now() - start,
    total: results.length,
    items,
  };
};

export const getKhanAcademyCollections = async (
  definitions: LinkedInLearningTopicDefinition[],
  options: Omit<LinkedInLearningSearchOptions, 'query' | 'topics'> & { limitPerTopic?: number } = {},
): Promise<LinkedInLearningTopicCollection[]> => {
  const rawLimitPerTopic = options.limitPerTopic ?? 4;
  const limitPerTopic = Math.min(Math.max(1, rawLimitPerTopic), 12);

  const collections = await Promise.all(
    definitions.map(async (definition) => {
      const result = await searchKhanAcademyCourses({
        ...options,
        query: definition.query,
        limit: limitPerTopic,
      });
      return { definition, result };
    }),
  );

  return collections;
};
