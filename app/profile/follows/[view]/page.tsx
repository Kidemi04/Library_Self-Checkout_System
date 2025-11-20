import Link from 'next/link';
import clsx from 'clsx';
import { redirect, notFound } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import type { DashboardRole } from '@/app/lib/auth/types';
import FollowActionButton from '@/app/profile/follow-action-button';

type FollowView = 'followers' | 'following';

type FollowEdgeProfile = {
  id: string;
  displayName: string | null;
  username: string | null;
  email: string | null;
  avatarUrl: string | null;
  faculty: string | null;
  department: string | null;
  role: DashboardRole;
  followedAt: string | null;
  mutual: boolean;
};

type FollowPageProps = {
  params: Promise<{ view: string }>;
  searchParams?: Promise<{ q?: string }>;
};

const toDashboardRole = (value: string | null | undefined): DashboardRole => {
  if (!value) return 'user';
  const normalized = value.trim().toLowerCase();
  if (normalized === 'admin') return 'admin';
  if (normalized === 'staff' || normalized === 'librarian') return 'staff';
  return 'user';
};

const getInitials = (name?: string | null, email?: string | null) => {
  const source = name ?? email;
  if (!source) return 'U';
  const trimmed = source.trim();
  if (!trimmed) return 'U';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const sanitizeSearch = (value: string | undefined): string => (value ?? '').trim();

const followerListStyles = {
  page: clsx('min-h-screen py-10', 'bg-swin-ivory text-swin-charcoal dark:bg-[#050b1a] dark:text-slate-100'),
  wrapper: 'mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8',
  card:
    'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/40 sm:p-8',
  heading: 'text-2xl font-semibold text-slate-900 dark:text-white',
  subheading: 'text-sm text-slate-500 dark:text-slate-300',
  list: 'mt-8 space-y-4',
  searchInput:
    'flex-1 rounded-2xl border border-slate-300 bg-white/80 px-4 py-2 text-sm shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/30 dark:border-white/10 dark:bg-slate-900/60 dark:text-white dark:focus:border-white/30 dark:focus:ring-white/10',
};

const loadFollowEdges = async (userId: string, view: FollowView): Promise<FollowEdgeProfile[]> => {
  try {
    const supabase = getSupabaseServerClient();
    const coreColumn = view === 'followers' ? 'followed_id' : 'follower_id';
    const relatedColumn = view === 'followers' ? 'follower_id' : 'followed_id';

    const { data: relationRows, error: relationError } = await supabase
      .from('friends')
      .select('follower_id, followed_id, approved_at, created_at, status')
      .eq(coreColumn, userId)
      .eq('status', 'accepted')
      .order('approved_at', { ascending: false, nullsFirst: false })
      .limit(400);

    if (relationError) {
      console.error('Failed to load follow edges', relationError);
      return [];
    }

    const rows = (relationRows ?? []).filter((row) => typeof row[relatedColumn] === 'string');
    const relatedIds = rows.map((row) => row[relatedColumn] as string);
    if (relatedIds.length === 0) return [];

    const [profileResult, userResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('user_id, display_name, username, avatar_url, faculty, department')
        .in('user_id', relatedIds),
      supabase.from('users').select('id, email, role').in('id', relatedIds),
    ]);

    if (profileResult.error) {
      console.error('Failed to load follow profiles', profileResult.error);
      return [];
    }

    if (userResult.error) {
      console.error('Failed to load user metadata for follows', userResult.error);
      return [];
    }

    let mutualSet = new Set<string>();
    if (relatedIds.length > 0) {
      const mutualQuery =
        view === 'followers'
          ? supabase
            .from('friends')
            .select('followed_id, status')
            .eq('follower_id', userId)
            .in('followed_id', relatedIds)
          : supabase
            .from('friends')
            .select('follower_id, status')
            .eq('followed_id', userId)
            .in('follower_id', relatedIds);

      const { data: mutualRows, error: mutualError } = await mutualQuery;
      if (mutualError) {
        console.error('Failed to load mutual follow data', mutualError);
      } else {
        const acceptedKey = view === 'followers' ? 'followed_id' : 'follower_id';
        mutualSet = new Set(
          (mutualRows ?? [])
            .filter((row: any) => row.status === 'accepted' && typeof row[acceptedKey] === 'string')
            .map((row: any) => row[acceptedKey] as string),
        );
      }
    }

    const profileMap = new Map((profileResult.data ?? []).map((row) => [row.user_id, row]));
    const userMap = new Map((userResult.data ?? []).map((row) => [row.id, row]));

    return rows.map((row) => {
      const targetId = row[relatedColumn] as string;
      const profile = profileMap.get(targetId);
      const baseUser = userMap.get(targetId);
      return {
        id: targetId,
        displayName: profile?.display_name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        faculty: profile?.faculty ?? null,
        department: profile?.department ?? null,
        email: baseUser?.email ?? null,
        role: toDashboardRole(baseUser?.role ?? null),
        followedAt: row.approved_at ?? row.created_at ?? null,
        mutual: mutualSet.has(targetId),
      };
    });
  } catch (error) {
    console.error('Unexpected failure loading follows', error);
    return [];
  }
};

const Avatar = ({ profile }: { profile: FollowEdgeProfile }) => {
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.displayName ?? profile.username ?? profile.email ?? 'Member avatar'}
        className="h-14 w-14 rounded-full border border-white/60 object-cover shadow-sm dark:border-white/20"
      />
    );
  }
  const initials = getInitials(profile.displayName, profile.email);
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
      {initials}
    </div>
  );
};

const buildSubtitle = (profile: FollowEdgeProfile) => {
  const username = profile.username ? `@${profile.username}` : null;
  if (username && profile.faculty) {
    return `${username} • ${profile.faculty}`;
  }
  if (username) return username;
  if (profile.faculty) return profile.faculty;
  return profile.email ?? 'No email provided';
};

const viewCopy: Record<FollowView, { heading: string; empty: string; description: string }> = {
  followers: {
    heading: 'Followers',
    description: 'Readers who follow your updates and recommendations.',
    empty: 'No one is following you yet.',
  },
  following: {
    heading: 'Following',
    description: 'People you follow to keep up with their reading journey.',
    empty: 'You are not following anyone yet.',
  },
};

export default async function FollowViewPage(props: FollowPageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await getDashboardSession();
  if (!session.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/profile')}`);
  }

  const viewParam = params.view;
  const isValidView = viewParam === 'followers' || viewParam === 'following';
  if (!isValidView) {
    notFound();
  }

  const view = viewParam as FollowView;
  const searchValue = sanitizeSearch(searchParams?.q);
  const edges = await loadFollowEdges(session.user.id, view);
  const filteredEdges = !searchValue
    ? edges
    : edges.filter((edge) => {
      const searchTarget = searchValue.toLowerCase();
      const candidates = [
        edge.displayName?.toLowerCase(),
        edge.username?.toLowerCase(),
        edge.email?.toLowerCase(),
        edge.faculty?.toLowerCase(),
        edge.department?.toLowerCase(),
      ].filter(Boolean) as string[];
      return candidates.some((value) => value.includes(searchTarget));
    });

  const copy = viewCopy[view];

  return (
    <main className={followerListStyles.page}>
      <div className={followerListStyles.wrapper}>
        <div className={followerListStyles.card}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={followerListStyles.heading}>{copy.heading}</h1>
              <p className={followerListStyles.subheading}>{copy.description}</p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              Back to profile
            </Link>
          </div>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" role="search">
            <input
              type="text"
              name="q"
              defaultValue={searchValue}
              placeholder={`Search ${view}`}
              className={followerListStyles.searchInput}
            />
            <div className="flex items-center gap-2">
              {searchValue ? (
                <Link
                  href={`/profile/follows/${view}`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/10"
                >
                  Clear
                </Link>
              ) : null}
              <button
                type="submit"
                className="rounded-full bg-swin-red px-4 py-2 text-sm font-semibold text-white transition hover:bg-swin-red/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swin-red dark:bg-emerald-500 dark:text-slate-900 dark:hover:bg-emerald-400 dark:focus-visible:outline-emerald-300"
              >
                Search
              </button>
            </div>
          </form>

          {filteredEdges.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
              {searchValue ? (
                <p>
                  No {view} match <span className="font-semibold">&ldquo;{searchValue}&rdquo;</span>.
                </p>
              ) : (
                <p>{copy.empty}</p>
              )}
            </div>
          ) : (
            <ul className={followerListStyles.list}>
              {filteredEdges.map((profile) => {
                const subtitle = buildSubtitle(profile);
                const timestamp = formatDate(profile.followedAt);
                return (
                  <li
                    key={profile.id}
                    className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <Avatar profile={profile} />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-900 dark:text-white">
                              {profile.displayName ?? profile.username ?? profile.email ?? 'Library Patron'}
                            </p>
                            {profile.mutual ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                Mutual
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-300">{subtitle}</p>
                          {timestamp ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {view === 'followers' ? 'Followed you on ' : 'You followed on '}
                              {timestamp}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end">
                        {view === 'followers' ? (
                          <div className="flex gap-2">
                            <FollowActionButton
                              targetUserId={profile.id}
                              variant="follow"
                              isFollowing={profile.mutual}
                            />
                            <FollowActionButton targetUserId={profile.id} variant="remove" />
                          </div>
                        ) : (
                          <FollowActionButton targetUserId={profile.id} variant="unfollow" />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
