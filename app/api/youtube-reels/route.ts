import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type ReelVideo = { videoId: string; title: string; channel: string; tags: string[] };

const FALLBACK: ReelVideo[] = [
  { videoId: 'DHjqpvDnNGE', title: 'JavaScript in 100 Seconds',  channel: 'Fireship', tags: ['JavaScript', 'Web Dev']  },
  { videoId: 'x7X9w_GIm1s', title: 'Python in 100 Seconds',      channel: 'Fireship', tags: ['Python', 'Programming'] },
  { videoId: 'hwP7WQkmECE', title: 'Git in 100 Seconds',          channel: 'Fireship', tags: ['Git', 'DevOps']         },
  { videoId: 'zsjvFFKOm3c', title: 'SQL in 100 Seconds',          channel: 'Fireship', tags: ['SQL', 'Database']       },
  { videoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds',  channel: 'Fireship', tags: ['TypeScript', 'Web Dev'] },
  { videoId: 'OEV8gMkCHXQ', title: 'CSS in 100 Seconds',          channel: 'Fireship', tags: ['CSS', 'Web Dev']        },
  { videoId: 'Gjnup-PuquQ', title: 'Docker in 100 Seconds',       channel: 'Fireship', tags: ['Docker', 'DevOps']      },
  { videoId: 'Mus_vwhTCq0', title: 'React in 100 Seconds',        channel: 'Fireship', tags: ['React', 'Web Dev']      },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q         = searchParams.get('q') ?? 'programming tutorial';
  const pageToken = searchParams.get('pageToken') ?? '';

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ videos: FALLBACK, nextPageToken: null });
  }

  try {
    const params = new URLSearchParams({
      part:            'snippet',
      q,
      type:            'video',
      videoDuration:   'short',
      videoEmbeddable: 'true',
      safeSearch:      'strict',
      maxResults:      '10',
      order:           'relevance',
      key:             apiKey,
    });
    if (pageToken) params.set('pageToken', pageToken);

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    if (data.error) throw new Error(data.error.message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos: ReelVideo[] = (data.items ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item.id?.videoId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => ({
        videoId: item.id.videoId as string,
        title:   item.snippet.title as string,
        channel: item.snippet.channelTitle as string,
        tags:    [],
      }));

    return NextResponse.json({
      videos,
      nextPageToken: (data.nextPageToken as string) ?? null,
    });
  } catch (err) {
    console.error('[youtube-reels]', err);
    return NextResponse.json({ videos: FALLBACK, nextPageToken: null });
  }
}
