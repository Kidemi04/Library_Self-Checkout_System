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

const ProfileValue = ({ value, isPrivileged }: { value?: string | null; isPrivileged: boolean }) => {
  if (value && value.trim().length > 0) {
    return <span className={isPrivileged ? 'text-slate-100' : 'text-slate-900'}>{value}</span>;
  }
  return (
    <span className={isPrivileged ? 'text-sm text-slate-500' : 'text-sm text-slate-400'}>Not provided</span>
  );
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
  const pageBgClass = clsx('min-h-screen py-10', isPrivileged ? 'bg-slate-900' : 'bg-swin-ivory/80');
  const wrapperClass = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';
  const cardClass = clsx(
    'overflow-hidden rounded-2xl',
    isPrivileged
      ? 'border border-white/10 bg-slate-900/70 text-slate-100 shadow-2xl shadow-slate-900/60 backdrop-blur'
      : 'bg-white text-slate-900 shadow',
  );
  const headerClass = clsx(
    'px-6 py-8 sm:px-8 border-b',
    isPrivileged ? 'border-white/10 bg-slate-900/40' : 'border-slate-200 bg-slate-50',
  );
  const headingClass = clsx('text-2xl font-semibold', isPrivileged ? 'text-white' : 'text-slate-900');
  const subheadingClass = clsx('text-sm', isPrivileged ? 'text-slate-300' : 'text-slate-600');
  const sectionHeadingClass = clsx(
    'text-sm font-semibold uppercase tracking-wide',
    isPrivileged ? 'text-slate-300' : 'text-slate-500',
  );
  const labelClass = clsx('text-xs uppercase', isPrivileged ? 'text-slate-400' : 'text-slate-500');
  const pillRoleClass = clsx(
    'rounded-full px-2.5 py-1 text-xs font-semibold',
    isPrivileged ? 'bg-white/10 text-white' : 'bg-swin-red/10 text-swin-red',
  );
  const pillSecondaryClass = clsx(
    'rounded-full px-2.5 py-1 text-xs font-semibold',
    isPrivileged ? 'bg-white/10 text-slate-200' : 'bg-slate-200 text-slate-600',
  );
  const initialsClass = clsx(
    'flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold',
    isPrivileged ? 'bg-slate-800 text-slate-200' : 'bg-swin-charcoal/10 text-swin-charcoal',
  );
  const bioBoxClass = clsx(
    'mt-4 rounded-lg border p-4 text-sm leading-relaxed',
    isPrivileged
      ? 'border-white/10 bg-white/5 text-slate-100/90'
      : 'border-slate-200 bg-slate-50 text-slate-700',
  );
  const bioPlaceholderClass = isPrivileged ? 'text-slate-500' : 'text-slate-400';
  const linksListClass = clsx('text-sm font-medium hover:underline', isPrivileged ? 'text-emerald-300' : 'text-swin-red');
  const linksEmptyClass = isPrivileged ? 'mt-4 text-sm text-slate-500' : 'mt-4 text-sm text-slate-400';
  const backButtonClass = clsx(
    'inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition shadow sm:w-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
    isPrivileged
      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white'
      : 'bg-swin-red text-white hover:bg-swin-red/90 focus-visible:outline-swin-red',
  );

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
                  <div
                    className={clsx(
                      'mt-3 flex flex-wrap justify-center sm:justify-start items-center gap-x-3 gap-y-2 text-xs font-medium',
                      isPrivileged ? 'text-slate-300' : 'text-slate-600',
                    )}
                  >
                    <span className={pillRoleClass}>{roleLabel}</span>
                    <span className={pillSecondaryClass}>Visibility: {visibilityLabel}</span>
                    {memberSince ? (
                      <span className={pillSecondaryClass}>Member since {memberSince}</span>
                    ) : null}
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
                  <div className={clsx(
                    'divide-y rounded-xl overflow-hidden max-w-full',
                    isPrivileged ? 'divide-white/10 bg-slate-900/60' : 'divide-slate-100 bg-slate-50'
                  )}>
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
                          <p className="mt-1 text-xs text-slate-500">
                            Student ID can only be edited by staff or admin.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Account Info */}
                <div className="hidden sm:block">
                  <div className={clsx(
                    'rounded-xl p-4 sm:p-5',
                    isPrivileged ? 'bg-slate-900/60' : 'bg-slate-50'
                  )}>
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
                            <p className="mt-1 text-xs text-slate-500">
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
                  <div className={clsx(
                    'rounded-xl p-4 sm:p-5',
                    isPrivileged ? 'bg-slate-900/60' : 'bg-slate-50'
                  )}>
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
