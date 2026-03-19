import clsx from 'clsx';

/**
 * Dashboard user info card
 */
type DashboardUserCardProps = {
  email?: string | null;
  role: string;
};

const roleLabel = (role: string) => {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  return 'User';
};

export default function DashboardUserCard({
  email,
  role,
}: DashboardUserCardProps) {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-5 text-sm text-white backdrop-blur-lg shadow-xl shadow-black/20">
      <p className="text-xs uppercase tracking-wide text-white/70">
        Signed in
      </p>

      {email && (
        <p
          className={clsx(
            'mt-1 break-words font-semibold',
            email.length > 40 ? 'text-xs' : 'text-sm'
          )}
        >
          {email}
        </p>
      )}

      <p className="mt-2 inline-flex rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
        Role: {roleLabel(role)}
      </p>
    </div>
  );
}
