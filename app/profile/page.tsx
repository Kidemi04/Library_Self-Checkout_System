import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';

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

const ProfileValue = ({ value }: { value?: string | null }) => {
  if (value && value.trim().length > 0) {
    return <span className="text-slate-900">{value}</span>;
  }
  return <span className="text-sm text-slate-400">Not provided</span>;
};

const ProfileNumberValue = ({ value }: { value?: number | null }) => {
  if (typeof value === 'number') {
    return <span className="text-slate-900">{value}</span>;
  }
  return <span className="text-sm text-slate-400">Not provided</span>;
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
  const roleLabel = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const memberSince = formatMemberSince(userRow?.created_at ?? null);
  const visibilityLabel = formatVisibility(profile.visibility);
  const links = normalizeLinks(profile.links);
  const preferredName = profile.display_name ?? user.name ?? null;
  const initials = getInitials(preferredName, user.email ?? null);

  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${preferredName ?? 'User'} avatar`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-swin-charcoal/10 text-lg font-semibold text-swin-charcoal">
                    {initials}
                  </div>
                )}

                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {preferredName ?? user.email ?? 'My Profile'}
                  </h1>
                  <p className="text-sm text-slate-600">{user.email ?? 'Email unavailable'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-600">
                    <span className="rounded-full bg-swin-red/10 px-2.5 py-1 text-swin-red">
                      {roleLabel}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1">
                      Visibility: {visibilityLabel}
                    </span>
                    {memberSince ? (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1">
                        Member since {memberSince}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-lg bg-swin-red px-4 py-2 text-sm font-semibold text-white shadow hover:bg-swin-red/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-swin-red sm:w-auto"
              >
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <section className="grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Account
                </h2>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Display name</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.display_name ?? user.name ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Email</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={user.email ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Username</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.username ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Student ID</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.student_id ?? null} />
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Contact
                </h2>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Phone</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.phone ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Preferred language</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.preferred_language ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Faculty</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.faculty ?? null} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Department</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileValue value={profile.department ?? null} />
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Academic
                </h2>
                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-xs uppercase text-slate-500">Intake year</dt>
                    <dd className="text-base font-medium text-slate-900">
                      <ProfileNumberValue value={profile.intake_year ?? null} />
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  About
                </h2>
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {profile.bio && profile.bio.trim().length > 0 ? (
                    <p className="whitespace-pre-line">{profile.bio}</p>
                  ) : (
                    <p className="text-slate-400">No bio provided yet.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Links
              </h2>
              {links.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                      <Link
                        href={link.url}
                        className="text-sm font-medium text-swin-red hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-400">No links added yet.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
