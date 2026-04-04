import {
  getLinkedInLearningStatus,
  searchLinkedInLearningCourses,
  getLinkedInLearningCollections,
} from '@/app/lib/linkedin/service';
import { searchKhanAcademyCourses, getKhanAcademyCollections } from '@/app/lib/khan/service';
import type {
  LinkedInLearningSearchOptions,
  LinkedInLearningSearchResult,
  LinkedInLearningTopicCollection,
  LinkedInLearningTopicDefinition,
} from '@/app/lib/linkedin/types';

export type LearningProvider = 'linkedin' | 'khan';

export type LearningStatus = {
  provider: LearningProvider;
  label: string;
  isLive: boolean;
};

export const getLearningStatus = async (): Promise<LearningStatus> => {
  const status = await getLinkedInLearningStatus();
  const isLinkedIn = status.enabled && status.isConfigured && !status.usingStub;
  return {
    provider: isLinkedIn ? 'linkedin' : 'khan',
    label: isLinkedIn ? 'LinkedIn Learning' : 'Khan Academy',
    isLive: isLinkedIn,
  };
};

export const searchLearningCourses = async (
  options: LinkedInLearningSearchOptions = {},
): Promise<LinkedInLearningSearchResult & { provider: LearningProvider; label: string }> => {
  const status = await getLearningStatus();
  const result = status.isLive
    ? await searchLinkedInLearningCourses(options)
    : await searchKhanAcademyCourses(options);
  return { ...result, provider: status.provider, label: status.label };
};

export const getLearningCollections = async (
  definitions: LinkedInLearningTopicDefinition[],
  options: Omit<LinkedInLearningSearchOptions, 'query' | 'topics'> & {
    limitPerTopic?: number;
  } = {},
): Promise<Array<LinkedInLearningTopicCollection & { provider: LearningProvider; label: string }>> => {
  const status = await getLearningStatus();
  const collections = status.isLive
    ? await getLinkedInLearningCollections(definitions, options)
    : await getKhanAcademyCollections(definitions, options);
  return collections.map((c) => ({ ...c, provider: status.provider, label: status.label }));
};
