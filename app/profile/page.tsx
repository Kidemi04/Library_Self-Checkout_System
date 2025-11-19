import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import ProfileNameForm from '@/app/profile/profile-name-form';
import ProfileAvatarForm from '@/app/profile/profile-avatar-form';
import ProfileEditForm from '@/app/profile/profile-edit-form';

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
            visibility
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
  const initials = getInitials(preferredName, user.email ?? null);
  const followersCount =
    typeof profile.followers_count === 'number' && !Number.isNaN(profile.followers_count)
      ? profile.followers_count
      : 0;
  const followingCount =
    typeof profile.following_count === 'number' && !Number.isNaN(profile.following_count)
      ? profile.following_count
      : 0;
  const pageBgClass = clsx(
    'min-h-screen py-10 transition-colors',
    'bg-swin-ivory text-swin-charcoal dark:bg-[#050b1a] dark:text-slate-100',
  );
  const wrapperClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
  const cardClass =
    'overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow transition-colors dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-100 dark:shadow-black/40';
  const headerClass = 'border-b border-slate-200 bg-white px-6 py-8 sm:px-8 dark:border-white/10 dark:bg-transparent';
  const headingClass = 'text-2xl font-semibold text-slate-900 dark:text-white';
  const subheadingClass = 'text-sm text-slate-600 dark:text-slate-300';
  const sectionHeadingClass = 'text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300';
  const labelClass = 'text-xs uppercase text-slate-500 dark:text-slate-400';
  const pillRoleClass = clsx(
    'rounded-full px-2.5 py-1 text-xs font-semibold',
    isPrivileged
      ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-100'
      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  );
  const pillSecondaryClass =
    'rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-200';
  const initialsClass =
    'flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700 dark:bg-slate-800 dark:text-white';
  const bioBoxClass =
    'mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100';
  const bioPlaceholderClass = 'text-slate-400 dark:text-slate-500';
  const linksListClass = clsx('text-sm font-medium hover:underline', isPrivileged ? 'text-emerald-500 dark:text-emerald-300' : 'text-swin-red dark:text-emerald-300');
  const linksEmptyClass = 'mt-4 text-sm text-slate-500 dark:text-slate-400';
  const backButtonClass =
    'inline-flex w-full items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white shadow transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto bg-swin-red hover:bg-swin-red/90 focus-visible:outline-swin-red dark:border-white/20 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:outline-white';
  const followLinkClass = clsx(
    'flex flex-col rounded-2xl border px-4 py-3 text-center transition',
    'border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10',
  );
  const followCountClass = 'text-2xl font-semibold text-slate-900 dark:text-white';
  const followLabelClass = 'mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300';

  return (
    <main className={pageBgClass}>
      <div className={wrapperClass}>
        <div className={cardClass}>
          <div className={headerClass}>
            {/* Mobile Back Button - Only visible on mobile */}
            <div className="mb-6 sm:hidden">
              <Link href="/dashboard" className={backButtonClass}>
                Back to dashboard
              </Link>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="flex justify-center sm:block">
                  <ProfileAvatarForm 
                    avatarUrl={profile.avatar_url ?? null}
                    displayName={preferredName}
                    isPrivileged={isPrivileged}
                  />
                </div>

                <div>
                  <h1 className={headingClass}>
                    {preferredName ?? user.email ?? 'My Profile'}
                  </h1>
                  <p className={clsx(subheadingClass, "break-words mt-1")}>
                    {user.email ?? 'Email unavailable'}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-300 sm:justify-start justify-center">
                    <span className={pillRoleClass}>{roleLabel}</span>
                    <span className={pillSecondaryClass}>Visibility: {visibilityLabel}</span>
                    {memberSince ? (
                      <span className={pillSecondaryClass}>Member since {memberSince}</span>
                    ) : null}
                  </div>
                  <div className="mt-6 grid w-full grid-cols-2 gap-3 sm:mt-4 sm:max-w-md">
                    <Link href="/profile/follows/followers" className={followLinkClass}>
                      <span className={followCountClass}>{followersCount}</span>
                      <span className={followLabelClass}>Followers</span>
                    </Link>
                    <Link href="/profile/follows/following" className={followLinkClass}>
                      <span className={followCountClass}>{followingCount}</span>
                      <span className={followLabelClass}>Following</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop Back Button - Hidden on mobile */}
              <div className="hidden sm:block">
                <Link href="/dashboard" className={backButtonClass}>
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>

          <div className="px-3 py-4 sm:px-10 sm:py-8">
            <section className="grid gap-6 sm:gap-8 lg:grid-cols-2">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={sectionHeadingClass}>Account</h2>
                </div>
                
                {/* Mobile Account Info */}
                <div className="block sm:hidden">
                  <div className="max-w-full divide-y divide-slate-100 overflow-hidden rounded-xl bg-white dark:divide-slate-800 dark:bg-slate-900">
                    <div className="p-4">
                      <span className={labelClass}>Display name</span>
                      <div className="mt-2">
                        <ProfileNameForm
                          displayName={profile.display_name ?? user.name ?? null}
                          username={profile.username ?? null}
                          isPrivileged={isPrivileged}
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <span className={labelClass}>Email</span>
                      <div className="mt-1 text-base font-medium break-all">
                        <ProfileValue value={user.email ?? null} isPrivileged={isPrivileged} />
                      </div>
                    </div>
                    <div className="p-4">
                      <span className={labelClass}>Username</span>
                      <div className="mt-1 text-base font-medium">
                        <ProfileValue value={profile.username ?? null} isPrivileged={isPrivileged} />
                      </div>
                    </div>
                    <div className="p-4">
                      <span className={labelClass}>Student ID</span>
                      <div className="mt-1 text-base font-medium">
                        <ProfileValue value={profile.student_id ?? null} isPrivileged={isPrivileged} />
                        {!isPrivileged && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Student ID can only be edited by staff or admin.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Account Info */}
                <div className="hidden sm:block">
                  <div className="rounded-xl bg-white p-4 sm:p-5 dark:bg-slate-900">
                    <dl className="grid gap-4">
                      <div>
                        <dt className={labelClass}>Display name</dt>
                        <dd className="mt-1.5">
                          <ProfileNameForm
                            displayName={profile.display_name ?? user.name ?? null}
                            username={profile.username ?? null}
                            isPrivileged={isPrivileged}
                          />
                        </dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Email</dt>
                        <dd className="mt-1.5 text-base font-medium break-words">
                          <ProfileValue value={user.email ?? null} isPrivileged={isPrivileged} />
                        </dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Username</dt>
                        <dd className="mt-1.5 text-base font-medium">
                          <ProfileValue value={profile.username ?? null} isPrivileged={isPrivileged} />
                        </dd>
                      </div>
                      <div>
                        <dt className={labelClass}>Student ID</dt>
                        <dd className="mt-1.5 text-base font-medium">
                          <ProfileValue value={profile.student_id ?? null} isPrivileged={isPrivileged} />
                          {!isPrivileged && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Student ID can only be edited by staff or admin.
                            </p>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

                <div className="space-y-6">
                  <h2 className={sectionHeadingClass}>Contact & Details</h2>
                  <div className="rounded-xl bg-white p-4 sm:p-5 dark:bg-slate-900">
                    <ProfileEditForm
                      username={profile.username ?? null}
                      phone={profile.phone ?? null}
                      preferredLanguage={profile.preferred_language ?? null}
                      faculty={profile.faculty ?? null}
                      department={profile.department ?? null}
                      bio={profile.bio ?? null}
                      isPrivileged={isPrivileged}
                    />
                  </div>
                </div>
            </section>

            <section className="mt-8 sm:mt-10">
              <h2 className={sectionHeadingClass}>Links</h2>
              {links.length > 0 ? (
                <ul className="mt-3 sm:mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                      <Link
                        href={link.url}
                        className={linksListClass}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={linksEmptyClass}>No links added yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
