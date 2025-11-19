'use server';

import { sampleLinkedInLearningAssets } from '@/app/lib/linkedin/sample-data';
import type {
  LinkedInLearningAsset,
  LinkedInLearningLevel,
  LinkedInLearningSearchOptions,
  LinkedInLearningSearchResult,
  LinkedInLearningStatus,
  LinkedInLearningTopicCollection,
  LinkedInLearningTopicDefinition,
} from '@/app/lib/linkedin/types';

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);
const parseBoolean = (value?: string | null) => {
  if (!value) return false;
  return TRUTHY.has(value.trim().toLowerCase());
};

const env = {
  clientId: (process.env.LINKEDIN_LEARNING_CLIENT_ID ?? '').trim(),
  clientSecret: (process.env.LINKEDIN_LEARNING_CLIENT_SECRET ?? '').trim(),
  organizationUrn: (process.env.LINKEDIN_LEARNING_ORGANIZATION_URN ?? '').trim(),
  defaultLocale: (process.env.LINKEDIN_LEARNING_DEFAULT_LOCALE ?? 'en_US').trim(),
  apiVersion: (process.env.LINKEDIN_LEARNING_API_VERSION ?? '202404').trim(),
  useStub: parseBoolean(process.env.LINKEDIN_LEARNING_USE_STUB),
  scope:
    (process.env.LINKEDIN_LEARNING_SCOPE ??
      'learning openid profile r_liteprofile r_emailaddress organization_learning')?.trim() ?? '',
  apiBase: (process.env.LINKEDIN_LEARNING_BASE_URL ?? 'https://api.linkedin.com').replace(/\/+$/, ''),
};

const hasCredentials = Boolean(env.clientId && env.clientSecret);
const stubMode = env.useStub || (!hasCredentials && process.env.NODE_ENV !== 'production');
const enabled = stubMode || hasCredentials;

type TokenCache = {
  token: string;
  expiresAt: number;
};

let cachedToken: TokenCache | null = null;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const normalizeLocale = (value?: string) => {
  const locale = (value ?? env.defaultLocale ?? 'en_US').trim();
  if (!locale) return 'en_US';
  return locale.replace('-', '_');
};

const toSkillLevel = (value: unknown): LinkedInLearningLevel | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'BEGINNER') return 'BEGINNER';
  if (normalized === 'INTERMEDIATE' || normalized === 'INTERMEDIATE_LEVEL') return 'INTERMEDIATE';
  if (normalized === 'ADVANCED') return 'ADVANCED';
  if (normalized === 'ALL') return 'ALL';
  return null;
};

const durationFromIso = (value: string): number | null => {
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(value);
  if (!match) return null;

  const days = match[1] ? Number(match[1]) : 0;
  const hours = match[2] ? Number(match[2]) : 0;
  const minutes = match[3] ? Number(match[3]) : 0;
  const seconds = match[4] ? Number(match[4]) : 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
};

const parseDurationSeconds = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    const iso = durationFromIso(trimmed);
    if (iso != null) return iso;
  }
  if (typeof value === 'object') {
    if (value && 'seconds' in value && typeof (value as { seconds?: number }).seconds === 'number') {
      return (value as { seconds?: number }).seconds ?? null;
    }
    if (value && 'duration' in value) {
      return parseDurationSeconds((value as { duration?: unknown }).duration);
    }
  }
  return null;
};

const formatDuration = (seconds: number | null): string | null => {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${secs}s`;
};

const pickText = (value: any): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.text === 'string') return value.text;
  if (value.localized && typeof value.localized === 'object') {
    if (value.preferredLocale) {
      const { language, country } = value.preferredLocale;
      const key = `${language}_${country}`;
      if (typeof value.localized[key] === 'string') {
        return value.localized[key];
      }
    }
    const localizedValue = Object.values(value.localized).find((entry) => typeof entry === 'string');
    if (typeof localizedValue === 'string') return localizedValue;
  }
  return null;
};

const pickUrl = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
};

const extractImageUrl = (raw: any) => {
  const candidates: Array<string | null | undefined> = [
    raw.imageUrl,
    raw.coverImageUrl,
    raw.squareLogoUrl,
    raw.image?.url,
    raw.image?.sources?.[0]?.url,
    raw.primaryImage?.url,
    raw.thumbnail?.url,
    raw.previewImage?.url,
  ];
  return pickUrl(...candidates);
};

const extractTopics = (raw: any) => {
  const buckets = [
    raw.topics,
    raw.skills,
    raw.skillTags,
    raw.tags,
    raw.assetCategories,
    raw.categories,
  ];
  const set = new Set<string>();

  const pushValue = (value: unknown) => {
    if (!value) return;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) set.add(trimmed);
      return;
    }
    if (typeof value === 'object') {
      if (typeof (value as { name?: string }).name === 'string') {
        pushValue((value as { name?: string }).name);
      } else if (typeof (value as { text?: string }).text === 'string') {
        pushValue((value as { text?: string }).text);
      }
    }
  };

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      bucket.forEach(pushValue);
    }
  }

  return Array.from(set);
};

const extractAuthors = (raw: any) => {
  const buckets = [raw.authors, raw.instructors, raw.contributors];
  const authors = [];

  const normaliseAuthor = (value: any) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      return { name: trimmed };
    }
    const name =
      pickText(value.name) ??
      value.fullName ??
      value.displayName ??
      (value.firstName || value.lastName
        ? `${value.firstName ?? ''} ${value.lastName ?? ''}`.trim()
        : null);
    if (!name) return null;

    return {
      name,
      title: pickText(value.title) ?? value.headline ?? null,
      profileUrl: pickUrl(value.profileUrl, value.publicProfileUrl, value.url),
    };
  };

  for (const bucket of buckets) {
    if (Array.isArray(bucket)) {
      bucket.forEach((entry) => {
        const normalised = normaliseAuthor(entry);
        if (normalised) authors.push(normalised);
      });
    }
  }

  return authors;
};

const detectContentType = (raw: any): LinkedInLearningAsset['contentType'] => {
  const typeValue = (raw.type ?? raw.contentType ?? raw.entityUrn ?? '').toString();
  if (typeValue.includes('learningPath')) return 'LEARNING_PATH';
  if (typeValue.includes('learningCourse')) return 'COURSE';
  if (typeValue.includes('learningVideo')) return 'VIDEO';
  if (typeof raw.assetType === 'string') {
    const normalised = raw.assetType.toUpperCase();
    if (normalised.includes('COURSE')) return 'COURSE';
    if (normalised.includes('VIDEO')) return 'VIDEO';
    if (normalised.includes('PATH')) return 'LEARNING_PATH';
  }
  return 'OTHER';
};

const toLearningAsset = (raw: any): LinkedInLearningAsset => {
  const urn =
    raw.entityUrn ??
    raw.urn ??
    raw.id ??
    `urn:li:learningAsset:temp-${Math.random().toString(36).slice(2)}`;
  const title =
    pickText(raw.title) ??
    pickText(raw.name) ??
    raw.slug ??
    'LinkedIn Learning course';
  const description =
    pickText(raw.description) ??
    pickText(raw.summary) ??
    null;
  const durationInSeconds = parseDurationSeconds(
    raw.durationInSeconds ?? raw.duration ?? raw.contentMetadata?.duration,
  );

  return {
    urn,
    title,
    description,
    url: pickUrl(
      raw.detailPageUrl,
      raw.details?.landingPageUrl,
      raw.webLaunchUrl,
      raw.url,
    ),
    imageUrl: extractImageUrl(raw),
    durationInSeconds,
    durationFormatted: formatDuration(durationInSeconds),
    skillLevel:
      toSkillLevel(raw.skillLevel) ??
      toSkillLevel(raw.difficulty) ??
      toSkillLevel(raw.level),
    releasedAt:
      raw.releasedOn ??
      raw.publishedDate ??
      raw.lastUpdatedDate ??
      null,
    topics: extractTopics(raw),
    authors: extractAuthors(raw),
    contentType: detectContentType(raw),
  };
};

const stubSearch = (
  options: LinkedInLearningSearchOptions,
  limit: number,
  startedAt: number,
): LinkedInLearningSearchResult => {
  const q = (options.query ?? '').trim().toLowerCase();
  const topics = (options.topics ?? []).map((topic) => topic.trim().toLowerCase());
  const difficulty = options.difficulty ?? 'ALL';

  let items = sampleLinkedInLearningAssets;

  if (q) {
    const rawTokens = q.split(/\s+/).map((token) => token.trim()).filter(Boolean);
    const meaningfulTokens = rawTokens.filter((token) => token.length > 2);
    const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

    if (tokens.length > 0) {
      items = items.filter((asset) => {
        const haystack = [
          asset.title,
          asset.description ?? '',
          ...(asset.topics ?? []),
          ...(asset.authors ?? []).map((author) => author.name),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());

        return tokens.every((token) => haystack.some((value) => value.includes(token)));
      });
    }
  }

  if (topics.length > 0) {
    items = items.filter((asset) => {
      const assetTopics = (asset.topics ?? []).map((topic) => topic.toLowerCase());
      return topics.some((topic) => assetTopics.includes(topic));
    });
  }

  if (difficulty && difficulty !== 'ALL') {
    items = items.filter((asset) => (asset.skillLevel ?? 'ALL') === difficulty);
  }

  const picked = items.slice(0, limit);

  return {
    source: 'stub',
    query: options.query ?? '',
    tookMs: Date.now() - startedAt,
    total: items.length,
    items: picked,
  };
};

export const getLinkedInLearningStatus = async (): Promise<LinkedInLearningStatus> => {
  if (!enabled) {
    return {
      enabled: false,
      isConfigured: hasCredentials,
      usingStub: false,
      locale: normalizeLocale(),
      organizationUrn: env.organizationUrn || null,
      reason: 'LinkedIn Learning integration is disabled - no credentials or stub mode available.',
    };
  }

  if (stubMode && !hasCredentials) {
    return {
      enabled: true,
      isConfigured: false,
      usingStub: true,
      locale: normalizeLocale(),
      organizationUrn: null,
      reason:
        'Using bundled sample data because LINKEDIN_LEARNING_CLIENT_ID or CLIENT_SECRET is not configured.',
    };
  }

  return {
    enabled: true,
    isConfigured: hasCredentials,
    usingStub: stubMode,
    locale: normalizeLocale(),
    organizationUrn: env.organizationUrn || null,
  };
};

const requestAccessToken = async (): Promise<TokenCache> => {
  if (!hasCredentials) {
    throw new Error('LinkedIn Learning credentials are not configured.');
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });

  if (env.scope) {
    body.set('scope', env.scope);
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn token request failed (${response.status}): ${text}`);
  }

  const payload = (await response.json()) as { access_token: string; expires_in?: number };
  const expiresInSeconds = Number(payload.expires_in ?? 3500);
  return {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(60, expiresInSeconds - 60) * 1000,
  };
};

const getAccessToken = async () => {
  if (!hasCredentials) {
    throw new Error('LinkedIn Learning credentials missing.');
  }
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  cachedToken = await requestAccessToken();
  return cachedToken.token;
};

type RawLearningAssetResponse = {
  elements?: any[];
  results?: any[];
  data?: any[];
  paging?: {
    total?: number;
  };
};

const fetchLinkedInLearningAssets = async (
  params: URLSearchParams,
): Promise<RawLearningAssetResponse> => {
  const token = await getAccessToken();
  const url = new URL('rest/learningAssets', `${env.apiBase}/`);
  url.search = params.toString();

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'LinkedIn-Version': env.apiVersion,
      'X-RestLi-Protocol-Version': '2.0.0',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn Learning API error (${response.status}): ${text}`);
  }

  return (await response.json()) as RawLearningAssetResponse;
};

const coalesceElements = (payload: RawLearningAssetResponse) => {
  if (!payload) return [];
  if (Array.isArray(payload.elements)) return payload.elements;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

export const searchLinkedInLearningCourses = async (
  options: LinkedInLearningSearchOptions = {},
): Promise<LinkedInLearningSearchResult> => {
  const started = Date.now();
  const limit = clamp(options.limit ?? 12, 1, 30);

  if (!enabled) {
    return {
      source: 'disabled',
      query: options.query ?? '',
      total: 0,
      items: [],
      tookMs: Date.now() - started,
      error: 'LinkedIn Learning is not configured.',
    };
  }

  if (stubMode || !hasCredentials) {
    return stubSearch(options, limit, started);
  }

  try {
    const params = new URLSearchParams();
    params.set('q', 'search');
    params.set('count', `${limit}`);
    params.set('start', '0');

    const locale = normalizeLocale(options.locale);
    params.set('locale', locale);

    const keywords = [options.query ?? '', ...(options.topics ?? [])]
      .map((value) => value?.trim())
      .filter(Boolean)
      .join(' ');
    if (keywords) {
      params.set('keywords', keywords);
    }

    const response = await fetchLinkedInLearningAssets(params);
    const elements = coalesceElements(response).map(toLearningAsset);
    const filtered =
      options.difficulty && options.difficulty !== 'ALL'
        ? elements.filter((asset) => (asset.skillLevel ?? 'ALL') === options.difficulty)
        : elements;

    return {
      source: 'api',
      query: options.query ?? keywords,
      total: filtered.length,
      items: filtered,
      tookMs: Date.now() - started,
    };
  } catch (error) {
    console.error('[LinkedIn Learning] search failed', error);
    if (stubMode) {
      return stubSearch(options, limit, started);
    }

    return {
      source: 'api',
      query: options.query ?? '',
      total: 0,
      items: [],
      tookMs: Date.now() - started,
      error: error instanceof Error ? error.message : 'LinkedIn Learning search failed.',
    };
  }
};

export const getLinkedInLearningCollections = async (
  definitions: LinkedInLearningTopicDefinition[],
  options: Omit<LinkedInLearningSearchOptions, 'query' | 'topics'> & { limitPerTopic?: number } = {},
): Promise<LinkedInLearningTopicCollection[]> => {
  if (!definitions.length) return [];
  const limitPerTopic = clamp(options.limitPerTopic ?? 4, 1, 12);

  const tasks = definitions.map(async (definition) => {
    const result = await searchLinkedInLearningCourses({
      ...options,
      query: definition.query,
      limit: limitPerTopic,
    });
    return {
      definition,
      result,
    };
  });

  return Promise.all(tasks);
};
