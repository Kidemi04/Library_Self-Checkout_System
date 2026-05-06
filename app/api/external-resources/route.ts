import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Article = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  faviconUrl: string | null;
};

type Video = {
  videoId: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  url: string;
};

type ExternalResourcesResponse = {
  ok: boolean;
  topic: string;
  articles: Article[];
  videos: Video[];
  error?: string;
};

type CacheEntry = {
  articles: Article[];
  videos: Video[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const cache = new Map<string, CacheEntry>();

const getEnv = () => ({
  braveApiKey: process.env.BRAVE_SEARCH_API_KEY?.trim(),
  youtubeApiKey: process.env.YOUTUBE_API_KEY?.trim(),
});

const cacheKey = (topic: string) => topic.toLowerCase().trim();

const fetchBraveArticles = async (topic: string): Promise<Article[]> => {
  const { braveApiKey } = getEnv();
  if (!braveApiKey) return [];

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', `${topic} books guide`);
    url.searchParams.set('count', '5');
    url.searchParams.set('safesearch', 'strict');
    url.searchParams.set('result_filter', 'web');

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': braveApiKey,
      },
    });

    if (!res.ok) {
      console.error('[external-resources] Brave API error', res.status, await res.text().catch(() => ''));
      return [];
    }

    const data = (await res.json()) as {
      web?: {
        results?: Array<{
          title?: string;
          url?: string;
          description?: string;
          profile?: { name?: string; img?: string };
          meta_url?: { hostname?: string; favicon?: string };
        }>;
      };
    };

    const results = data.web?.results ?? [];
    return results
      .slice(0, 5)
      .map((r) => ({
        title: (r.title ?? '').replace(/<[^>]+>/g, '').trim(),
        url: r.url ?? '',
        snippet: (r.description ?? '').replace(/<[^>]+>/g, '').trim(),
        source: r.profile?.name ?? r.meta_url?.hostname ?? 'Web',
        faviconUrl: r.meta_url?.favicon ?? r.profile?.img ?? null,
      }))
      .filter((a) => a.title && a.url);
  } catch (err) {
    console.error('[external-resources] Brave fetch failed', err);
    return [];
  }
};

const fetchYouTubeVideos = async (topic: string): Promise<Video[]> => {
  const { youtubeApiKey } = getEnv();
  if (!youtubeApiKey) return [];

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', `${topic} tutorial`);
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', '4');
    url.searchParams.set('safeSearch', 'strict');
    url.searchParams.set('relevanceLanguage', 'en');
    url.searchParams.set('videoEmbeddable', 'true');
    url.searchParams.set('key', youtubeApiKey);

    const res = await fetch(url.toString());

    if (!res.ok) {
      console.error('[external-resources] YouTube API error', res.status, await res.text().catch(() => ''));
      return [];
    }

    const data = (await res.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          publishedAt?: string;
          thumbnails?: { medium?: { url?: string }; high?: { url?: string } };
        };
      }>;
    };

    const items = data.items ?? [];
    return items
      .map((v) => {
        const videoId = v.id?.videoId ?? '';
        return {
          videoId,
          title: v.snippet?.title ?? '',
          channel: v.snippet?.channelTitle ?? '',
          thumbnailUrl:
            v.snippet?.thumbnails?.medium?.url ??
            v.snippet?.thumbnails?.high?.url ??
            '',
          publishedAt: v.snippet?.publishedAt ?? null,
          url: videoId ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}` : '',
        };
      })
      .filter((v) => v.videoId && v.title);
  } catch (err) {
    console.error('[external-resources] YouTube fetch failed', err);
    return [];
  }
};

export async function POST(request: Request) {
  let body: { topic?: string };
  try {
    body = (await request.json()) as { topic?: string };
  } catch {
    return NextResponse.json<ExternalResourcesResponse>(
      { ok: false, topic: '', articles: [], videos: [], error: 'Invalid request payload.' },
      { status: 400 },
    );
  }

  const topic = String(body.topic ?? '').trim();
  if (!topic) {
    return NextResponse.json<ExternalResourcesResponse>(
      { ok: false, topic: '', articles: [], videos: [], error: 'Topic is required.' },
      { status: 400 },
    );
  }

  const key = cacheKey(topic);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json<ExternalResourcesResponse>({
      ok: true,
      topic,
      articles: cached.articles,
      videos: cached.videos,
    });
  }

  const [articles, videos] = await Promise.all([
    fetchBraveArticles(topic),
    fetchYouTubeVideos(topic),
  ]);

  cache.set(key, { articles, videos, fetchedAt: now });

  if (cache.size > 200) {
    for (const [k, v] of cache.entries()) {
      if (now - v.fetchedAt > CACHE_TTL_MS) cache.delete(k);
    }
  }

  return NextResponse.json<ExternalResourcesResponse>({
    ok: true,
    topic,
    articles,
    videos,
  });
}
