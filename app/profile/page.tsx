import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getDashboardSession } from '@/app/lib/auth/session';
import { getSupabaseServerClient } from '@/app/lib/supabase/server';
import ProfileAvatarForm from '@/app/profile/profileAvatarForm';
import ProfileEditForm from '@/app/profile/profileEditForm';
import BlurFade from '@/app/ui/magicUi/blurFade';
import RoleBadge from '@/app/ui/dashboard/primitives/RoleBadge';
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
    return <span className="font-medium text-swin-charcoal dark:text-white">{value}</span>;
  }
  return <span className="text-[12px] text-swin-charcoal/40 dark:text-white/40">Not provided</span>;
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
        .from('UserProfile')
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
        .from('Users')
        .select('created_at')
        .eq('id', user.id)
        .maybeSingle<{ created_at: string | null }>(),
    ]);

  if (profileError) console.error('Failed to load profile', profileError);
  if (userError) console.error('Failed to load user metadata', userError);

  const profile = profileRow ?? {};
  const isPrivileged = user.role === 'staff' || user.role === 'admin';
  const memberSince = formatMemberSince(userRow?.created_at ?? null);
  const visibilityLabel = formatVisibility(profile.visibility);
  const links = normalizeLinks(profile.links);
  const preferredName = profile.display_name ?? user.name ?? null;

  const pageWrapperClass = clsx(
    'min-h-screen py-10 transition-colors sm:py-14',
    'bg-slate-50 text-swin-charcoal dark:bg-swin-dark-bg dark:text-white',
  );

  return (
    <main className={pageWrapperClass}>
      <title>My Profile</title>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <BlurFade delay={0.05} yOffset={12}>
          <header className="mb-8 border-b border-swin-charcoal/10 pb-6 dark:border-white/10">
            <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[2px] text-swin-charcoal/40 dark:text-white/40">
              Account
            </p>
            <h1 className="font-display text-[34px] font-semibold leading-none tracking-tight text-swin-charcoal dark:text-white">
              My Profile
            </h1>
            <p className="mt-2 text-[13px] text-swin-charcoal/60 dark:text-white/50">
              Keep your identity and contact details up to date so other patrons and staff can reach you.
            </p>
          </header>
        </BlurFade>

        <div className="grid gap-7 lg:grid-cols-[320px_1fr]">
          {/* ── LEFT COLUMN — identity card + summary ───────────────────── */}
          <aside className="space-y-5">
            <BlurFade delay={0.1} yOffset={12}>
              <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-swin-red/15 to-transparent blur-lg" />
                    <ProfileAvatarForm
                      avatarUrl={profile.avatar_url ?? null}
                      displayName={preferredName}
                      isPrivileged={isPrivileged}
                    />
                  </div>
                  <p className="font-display text-[22px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                    {preferredName ?? user.email ?? 'My Profile'}
                  </p>
                  {profile.username && (
                    <p className="mt-0.5 font-mono text-[11px] text-swin-charcoal/50 dark:text-white/50">
                      @{profile.username}
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-swin-charcoal/55 dark:text-white/55">
                    {user.email ?? 'Email unavailable'}
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    <RoleBadge role={user.role ?? 'user'} />
                    <span className="inline-flex items-center rounded-full border border-swin-charcoal/15 bg-swin-charcoal/5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.6px] text-swin-charcoal/70 dark:border-white/15 dark:bg-white/5 dark:text-white/70">
                      {visibilityLabel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </section>
            </BlurFade>

            <BlurFade delay={0.18} yOffset={12}>
              <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface">
                <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/45 dark:text-white/45">
                  Activity summary
                </p>
                <dl className="space-y-3 text-[13px]">
                  <div className="flex items-baseline justify-between">
                    <dt className="text-swin-charcoal/55 dark:text-white/55">Faculty</dt>
                    <dd className="font-medium text-swin-charcoal dark:text-white">
                      {profile.faculty ?? '—'}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-swin-charcoal/55 dark:text-white/55">Department</dt>
                    <dd className="font-medium text-swin-charcoal dark:text-white">
                      {profile.department ?? '—'}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <dt className="text-swin-charcoal/55 dark:text-white/55">Intake year</dt>
                    <dd className="font-mono text-swin-charcoal dark:text-white">
                      {profile.intake_year ?? '—'}
                    </dd>
                  </div>
                  {memberSince && (
                    <div className="flex items-baseline justify-between border-t border-swin-charcoal/8 pt-3 dark:border-white/8">
                      <dt className="text-swin-charcoal/55 dark:text-white/55">Member since</dt>
                      <dd className="font-mono text-[12px] text-swin-charcoal dark:text-white">
                        {memberSince}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </BlurFade>
          </aside>

          {/* ── RIGHT COLUMN — identity + contact + links ───────────────── */}
          <div className="space-y-5">
            <BlurFade delay={0.22} yOffset={12}>
              <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
                <h2 className="mb-4 font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                  Identity
                </h2>
                <div className="divide-y divide-swin-charcoal/8 dark:divide-white/8">
                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                      Display name
                    </span>
                    <div className="sm:text-right text-[13px]">
                      <ProfileValue value={preferredName} isPrivileged={isPrivileged} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                      Username
                    </span>
                    <div className="sm:text-right text-[13px]">
                      <ProfileValue value={profile.username ?? null} isPrivileged={isPrivileged} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.6px] text-swin-charcoal/45 dark:text-white/45">
                      Student ID
                    </span>
                    <div className="sm:text-right text-[13px]">
                      <ProfileValue value={profile.student_id ?? null} isPrivileged={isPrivileged} />
                      {!isPrivileged && (
                        <p className="mt-0.5 font-mono text-[10px] text-swin-charcoal/40 dark:text-white/40">
                          Managed by admin
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </BlurFade>

            <BlurFade delay={0.28} yOffset={12}>
              <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 dark:border-white/10 dark:bg-swin-dark-surface">
                <h2 className="mb-4 font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                  Contact & details
                </h2>
                <ProfileEditForm
                  displayName={profile.display_name ?? user.name ?? null}
                  username={profile.username ?? null}
                  phone={profile.phone ?? null}
                  preferredLanguage={profile.preferred_language ?? null}
                  faculty={profile.faculty ?? null}
                  department={profile.department ?? null}
                  bio={profile.bio ?? null}
                  isPrivileged={isPrivileged}
                />
              </section>
            </BlurFade>

            <BlurFade delay={0.34} yOffset={12}>
              <section className="rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
                <h2 className="px-6 pt-5 font-display text-[20px] font-semibold tracking-tight text-swin-charcoal dark:text-white">
                  Links
                </h2>
                {links.length > 0 ? (
                  <ul className="mt-3 divide-y divide-swin-charcoal/8 dark:divide-white/8">
                    {links.map((link) => (
                      <li key={`${link.label}-${link.url}`}>
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        >
                          <span className="text-[13px] font-semibold text-swin-red">
                            {link.label}
                          </span>
                          <ChevronRightIcon className="h-4 w-4 text-swin-charcoal/30 dark:text-white/30" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-6 pb-6 pt-3 text-[12px] text-swin-charcoal/45 dark:text-white/45">
                    No links added yet.
                  </p>
                )}
              </section>
            </BlurFade>
          </div>
        </div>
      </div>
    </main>
  );
}
