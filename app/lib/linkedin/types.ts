export type LinkedInLearningSource = 'api' | 'stub' | 'disabled';

export type LinkedInLearningLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL';

export type LinkedInLearningContentType = 'COURSE' | 'VIDEO' | 'LEARNING_PATH' | 'OTHER';

export interface LinkedInLearningAuthor {
  name: string;
  title?: string | null;
  profileUrl?: string | null;
}

export interface LinkedInLearningAsset {
  urn: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  durationInSeconds: number | null;
  durationFormatted: string | null;
  skillLevel: LinkedInLearningLevel | null;
  releasedAt: string | null;
  topics: string[];
  authors: LinkedInLearningAuthor[];
  contentType: LinkedInLearningContentType;
}

export interface LinkedInLearningSearchOptions {
  query?: string;
  topics?: string[];
  limit?: number;
  locale?: string;
  difficulty?: LinkedInLearningLevel | 'ALL';
}

export interface LinkedInLearningSearchResult {
  source: LinkedInLearningSource;
  query: string;
  tookMs: number;
  total: number;
  items: LinkedInLearningAsset[];
  error?: string;
}

export interface LinkedInLearningStatus {
  enabled: boolean;
  isConfigured: boolean;
  usingStub: boolean;
  locale: string;
  organizationUrn?: string | null;
  reason?: string;
}

export interface LinkedInLearningTopicDefinition {
  key: string;
  title: string;
  query: string;
  description?: string;
  icon?: string;
}

export interface LinkedInLearningTopicCollection {
  definition: LinkedInLearningTopicDefinition;
  result: LinkedInLearningSearchResult;
}
