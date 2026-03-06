import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import ProfileNameForm from '@/app/profile/profile-name-form';
import ProfileAvatarForm from '@/app/profile/profile-avatar-form';
import ProfileEditForm from '@/app/profile/profile-edit-form';
import GlassCard from '@/app/ui/magic-ui/glass-card';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

type ProfileRow = {
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  preferred_language?: string | null;
  bio?: string | null;
  faculty?: string | null;
  department?: string | null;
  intake_year?: number | null;
  student_id?: string | null;
  links?: unknown;
  visibility?: string | null;
  followers_count?: number | null;
  following_count?: number | null;
};

type ProfileLinks = Array<{ label: string; url: string }>;

const normalizeLinks = (value: unknown): ProfileLinks => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return { label: `Link ${index + 1}`, url: entry };
        }
        if (entry && typeof entry === 'object') {
          const labelCandidate = (entry as { label?: unknown }).label;
          const urlCandidate = (entry as { url?: unknown }).url;
          const label =
            typeof labelCandidate === 'string' && labelCandidate.trim().length > 0
              ? labelCandidate
              : `Link ${index + 1}`;
          const url =
            typeof urlCandidate === 'string' && urlCandidate.trim().length > 0 ? urlCandidate : null;
          if (!url) return null;
          return { label, url };
        }
        return null;
      })
      .filter((entry): entry is { label: string; url: string } => Boolean(entry));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, url]) => typeof url === 'string' && (url as string).trim().length > 0)
      .map(([label, url]) => ({
        label,
        url: url as string,
      }));
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return [{ label: 'Link', url: value }];
  }

  return [];
};

const formatVisibility = (value?: string | null) => {
  if (!value) return 'Campus';
  if (value === value.toUpperCase()) {
    const normalized = value.toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return value;
};

const formatMemberSince = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
};

const ProfileValue = ({ value }: { value?: string | null; isPrivileged: boolean }) => {
  if (value && value.trim().length > 0) {
    return <span className="text-slate-900 dark:text-slate-100">{value}</span>;
  }
  return <span className="text-sm text-slate-500 dark:text-slate-400">Not provided</span>;
};

export default async function ProfilePage() {
  const session = await getDashboardSession();
  const user = session.user;

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/profile')}`);
  }

  const supabase = getSupabaseServerClient();
  const [{ data: profileRow, error: profileError }, { data: userRow, error: userError }] =
    await Promise.all([
      supabase
        .from('user_profiles')
        .select(
          `
            display_name,
            username,
            avatar_url,
            phone,
            preferred_language,
            bio,
            faculty,
            department,
            intake_year,
            student_id,
            links,
            visibility,
            followers_count,
            following_count
          `,
        )
        .eq('user_id', user.id)
        .maybeSingle<ProfileRow>(),
      supabase
        .from('users')
        .select('created_at')
        .eq('id', user.id)
        .maybeSingle<{ created_at: string | null }>(),
    ]);

  if (profileError) {
    console.error('Failed to load profile for current user', profileError);
  }

  if (userError) {
    console.error('Failed to load metadata for current user', userError);
  }

  const profile = profileRow ?? {};
  const isPrivileged = user.role === 'staff' || user.role === 'admin';
  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const memberSince = formatMemberSince(userRow?.created_at ?? null);
  const visibilityLabel = formatVisibility(profile.visibility);
  const links = normalizeLinks(profile.links);
  const preferredName = profile.display_name ?? user.name ?? null;
  const followersCount =
    typeof profile.followers_count === 'number' && !Number.isNaN(profile.followers_count)
      ? profile.followers_count
      : 0;
  const followingCount =
    typeof profile.following_count === 'number' && !Number.isNaN(profile.following_count)
      ? profile.following_count
      : 0;

  const pageBgClass = clsx(
    'min-h-screen py-8 transition-colors sm:py-12',
    'bg-swin-ivory text-swin-charcoal dark:bg-[#050b1a] dark:text-slate-100',
  );
  const wrapperClass = 'mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8';

  const labelClass = 'text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';
  const sectionTitleClass = 'text-lg font-semibold text-slate-900 dark:text-white mb-4 px-1';

  return (
    <main className={pageBgClass}>
      <div className={wrapperClass}>

        {/* 1. Hero Section */}
        <BlurFade delay={0.1} yOffset={20}>
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-swin-red/20 to-transparent blur-xl dark:from-swin-red/10" />
              <ProfileAvatarForm
                avatarUrl={profile.avatar_url ?? null}
                displayName={preferredName}
                isPrivileged={isPrivileged}
              />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {preferredName ?? user.email ?? 'My Profile'}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              {user.email ?? 'Email unavailable'}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className={clsx(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
                isPrivileged
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20'
                  : 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20'
              )}>
                {roleLabel}
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20 dark:bg-slate-400/10 dark:text-slate-400 dark:ring-slate-400/20">
                {visibilityLabel}
              </span>
            </div>
          </div>
        </BlurFade>

        {/* 2. Stats Row */}
        <BlurFade delay={0.2} yOffset={20}>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/profile/follows/followers" className="group block">
              <GlassCard intensity="low" className="flex flex-col items-center justify-center py-6 transition-transform duration-300 hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-white/10">
                <span className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-swin-red transition-colors">
                  {followersCount}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Followers
                </span>
              </GlassCard>
            </Link>
            <Link href="/profile/follows/following" className="group block">
              <GlassCard intensity="low" className="flex flex-col items-center justify-center py-6 transition-transform duration-300 hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-white/10">
                <span className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-swin-red transition-colors">
                  {followingCount}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Following
                </span>
              </GlassCard>
            </Link>
          </div>
        </BlurFade>

        {/* 3. Identity Section */}
        <BlurFade delay={0.3} yOffset={20}>
          <section>
            <h2 className={sectionTitleClass}>Identity</h2>
            <GlassCard intensity="medium" className="divide-y divide-slate-200/50 dark:divide-white/10">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={labelClass}>Display Name</span>
                <div className="sm:text-right">
                  <ProfileNameForm
                    displayName={profile.display_name ?? user.name ?? null}
                    username={profile.username ?? null}
                    isPrivileged={isPrivileged}
                  />
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={labelClass}>Username</span>
                <div className="sm:text-right text-sm font-medium text-slate-900 dark:text-white">
                  <ProfileValue value={profile.username ?? null} isPrivileged={isPrivileged} />
                </div>
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className={labelClass}>Student ID</span>
                <div className="sm:text-right text-sm font-medium text-slate-900 dark:text-white">
                  <ProfileValue value={profile.student_id ?? null} isPrivileged={isPrivileged} />
                  {!isPrivileged && (
                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                      Managed by admin
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </section>
        </BlurFade>

        {/* 4. Contact & Details Section */}
        <BlurFade delay={0.4} yOffset={20}>
          <section>
            <h2 className={sectionTitleClass}>Contact & Details</h2>
            <GlassCard intensity="medium" className="p-4 sm:p-6">
              <ProfileEditForm
                username={profile.username ?? null}
                phone={profile.phone ?? null}
                preferredLanguage={profile.preferred_language ?? null}
                faculty={profile.faculty ?? null}
                department={profile.department ?? null}
                bio={profile.bio ?? null}
                isPrivileged={isPrivileged}
              />
            </GlassCard>
          </section>
        </BlurFade>

        {/* 5. Links Section */}
        <BlurFade delay={0.5} yOffset={20}>
          <section>
            <h2 className={sectionTitleClass}>Links</h2>
            <GlassCard intensity="medium" className="overflow-hidden">
              {links.length > 0 ? (
                <ul className="divide-y divide-slate-200/50 dark:divide-white/10">
                  {links.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 sm:p-5 transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5 group"
                      >
                        <span className="text-sm font-medium text-swin-red dark:text-emerald-400 group-hover:underline">
                          {link.label}
                        </span>
                        <ChevronRightIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No links added yet.</p>
                </div>
              )}
            </GlassCard>
          </section>
        </BlurFade>

        {/* Member Since Footer */}
        <BlurFade delay={0.6} yOffset={20}>
          <div className="text-center">
            {memberSince && (
              <p className="text-xs font-medium text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                Member since {memberSince}
              </p>
            )}
          </div>
        </BlurFade>

      </div>
    </main>
  );
}
