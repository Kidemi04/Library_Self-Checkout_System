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

export type LearningStatus = {
  isLive: boolean;
  usingStub: boolean;
};

export const getLearningStatus = async (): Promise<LearningStatus> => {
  const status = await getLinkedInLearningStatus();
  const isLive = status.enabled && status.isConfigured && !status.usingStub;
  return { isLive, usingStub: status.usingStub };
};

export const searchLearningCourses = async (
  options: LinkedInLearningSearchOptions = {},
): Promise<LinkedInLearningSearchResult> => {
  return searchLinkedInLearningCourses(options);
};

export const getLearningCollections = async (
  definitions: LinkedInLearningTopicDefinition[],
  options: Omit<LinkedInLearningSearchOptions, 'query' | 'topics'> & {
    limitPerTopic?: number;
  } = {},
): Promise<LinkedInLearningTopicCollection[]> => {
  return getLinkedInLearningCollections(definitions, options);
};
