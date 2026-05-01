import {
  getLinkedInLearningStatus,
  searchLinkedInLearningCourses,
  getLinkedInLearningCollections,
} from '@/app/lib/linkedin/service';
import type {
  LinkedInLearningSearchOptions,
  LinkedInLearningSearchResult,
  LinkedInLearningTopicCollection,
  LinkedInLearningTopicDefinition,
} from '@/app/lib/linkedin/types';

export type LearningProvider = 'linkedin';

export type LearningStatus = {
  provider: LearningProvider;
  label: string;
  isLive: boolean;
};

export const getLearningStatus = async (): Promise<LearningStatus> => {
  const status = await getLinkedInLearningStatus();
  const isLive = status.enabled && status.isConfigured && !status.usingStub;
  return {
    provider: 'linkedin',
    label: 'LinkedIn Learning',
    isLive,
  };
};

export const searchLearningCourses = async (
  options: LinkedInLearningSearchOptions = {},
): Promise<LinkedInLearningSearchResult & { provider: LearningProvider; label: string }> => {
  const status = await getLearningStatus();
  const result = await searchLinkedInLearningCourses(options);
  return { ...result, provider: status.provider, label: status.label };
};

export const getLearningCollections = async (
  definitions: LinkedInLearningTopicDefinition[],
  options: Omit<LinkedInLearningSearchOptions, 'query' | 'topics'> & {
    limitPerTopic?: number;
  } = {},
): Promise<Array<LinkedInLearningTopicCollection & { provider: LearningProvider; label: string }>> => {
  const status = await getLearningStatus();
  const collections = await getLinkedInLearningCollections(definitions, options);
  return collections.map((c) => ({ ...c, provider: status.provider, label: status.label }));
};
