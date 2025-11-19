'use client';

import { Fragment, useEffect, useMemo, useState, useTransition } from 'react';
import clsx from 'clsx';
import { supabaseBrowserClient } from '@/app/lib/supabase/client';
import { addUserAction } from '@/app/actions/addUser';
import { updateUserAction } from '@/app/actions/updateUser';
import { deleteUserAction } from '@/app/actions/deleteUser';

type ManagedRole = 'user' | 'staff' | 'admin';

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'json' | 'boolean';

type ProfileFieldConfig = {
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  maxLength?: number;
  rows?: number;
};

type ManagedUser = {
  id: string;
  email: string;
  role: ManagedRole;
  fullName: string;
  accountDisplayName: string;
  createdAt: string | null;
  updatedAt: string | null;
  profile: Record<string, string>;
  profileFieldTypes: Record<string, FieldType>;
};

const roleOptions: ManagedRole[] = ['user', 'staff', 'admin'];
const PAGE_SIZE = 25;

const visibilityOptions = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'PRIVATE', label: 'Private' },
];

const baseProfileFieldOrder = [
  'display_name',
  'username',
  'phone',
  'student_id',
  'preferred_language',
  'faculty',
  'department',
  'intake_year',
  'visibility',
  'bio',
  'links',
  'avatar_url',
];

const PROFILE_FIELD_CONFIG: Record<string, ProfileFieldConfig> = {
  display_name: {
    label: 'Preferred display name',
    type: 'text',
    maxLength: 120,
    placeholder: 'Name shown to patrons',
  },
  username: {
    label: 'Username',
    type: 'text',
    maxLength: 60,
    placeholder: 'Unique username for search login',
  },
  phone: {
    label: 'Phone number',
    type: 'text',
    placeholder: '+60 12 345 6789',
  },
  student_id: {
    label: 'Student ID',
    type: 'text',
    placeholder: 'e.g. 123456',
  },
  preferred_language: {
    label: 'Preferred language',
    type: 'text',
  },
  faculty: {
    label: 'Faculty',
    type: 'text',
  },
  department: {
    label: 'Department',
    type: 'text',
  },
  intake_year: {
    label: 'Intake year',
    type: 'number',
  },
  visibility: {
    label: 'Profile visibility',
    type: 'select',
    options: visibilityOptions,
    description: 'Controls who on campus can view this profile information.',
  },
  bio: {
    label: 'Bio',
    type: 'textarea',
    rows: 4,
    maxLength: 500,
  },
  links: {
    label: 'Links (JSON)',
    type: 'json',
    rows: 4,
    description: 'Provide an array or object of links, e.g. [{"label":"Portfolio","url":"https://"}].',
  },
  avatar_url: {
    label: 'Avatar URL',
    type: 'text',
    placeholder: 'https://…',
  },
};

const toTitleCase = (value: string) =>
  value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const inferFieldType = (key: string, value: unknown): FieldType => {
  const configured = PROFILE_FIELD_CONFIG[key];
  if (configured) return configured.type;
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (value && typeof value === 'object') return 'json';
  return 'text';
};

const toInputValue = (value: unknown, type: FieldType): string => {
  if (value === null || value === undefined) return '';
  if (type === 'json') {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  if (type === 'boolean') {
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value).toLowerCase();
  }
  return String(value);
};

const sanitizeProfileRow = (profile: Record<string, unknown> | null | undefined) => {
  if (!profile) return {};
  const result: Record<string, unknown> = {};
  Object.entries(profile).forEach(([key, value]) => {
    if (key === 'user_id' || key === 'created_at' || key === 'updated_at') return;
    result[key] = value;
  });
  return result;
};

type ProfileSanitizeSuccess = {
  ok: true;
  payload: Record<string, unknown>;
  normalizedValues: Record<string, string>;
};

type ProfileSanitizeFailure = {
  ok: false;
  error: string;
};

const sanitizeProfileValues = (
  profile: Record<string, string>,
  profileFieldTypes: Record<string, FieldType>,
): ProfileSanitizeSuccess | ProfileSanitizeFailure => {
  const payload: Record<string, unknown> = {};
  const normalizedValues: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(profile)) {
    const config = PROFILE_FIELD_CONFIG[key];
    const type = profileFieldTypes[key] ?? config?.type ?? 'text';
    const label = config?.label ?? toTitleCase(key);

    if (type === 'json') {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        payload[key] = null;
        normalizedValues[key] = '';
        continue;
      }
      try {
        const parsed = JSON.parse(trimmed);
        payload[key] = parsed;
        normalizedValues[key] = JSON.stringify(parsed, null, 2);
      } catch (err) {
        console.error('Failed to parse JSON profile field', key, err);
        return { ok: false, error: `Field "${label}" must be valid JSON.` };
      }
      continue;
    }

    if (type === 'number') {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        payload[key] = null;
        normalizedValues[key] = '';
        continue;
      }
      const numberValue = Number(trimmed);
      if (Number.isNaN(numberValue)) {
        return { ok: false, error: `Field "${label}" must be a number.` };
      }
      payload[key] = numberValue;
      normalizedValues[key] = String(numberValue);
      continue;
    }

    if (type === 'boolean') {
      const normalized = rawValue.trim().toLowerCase();
      if (!normalized) {
        payload[key] = null;
        normalizedValues[key] = '';
        continue;
      }
      if (normalized === 'true' || normalized === 'false') {
        payload[key] = normalized === 'true';
        normalizedValues[key] = normalized;
        continue;
      }
      return { ok: false, error: `Field "${label}" must be either true or false.` };
    }

    const trimmed = rawValue.trim();
    payload[key] = trimmed === '' ? null : trimmed;
    normalizedValues[key] = trimmed;
  }

  return { ok: true, payload, normalizedValues };
};

const getProfileKeys = (user: ManagedUser) => {
  const keys = new Set<string>(baseProfileFieldOrder);
  Object.keys(user.profile).forEach((key) => keys.add(key));
  return Array.from(keys);
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    fullName: '',
    role: 'staff' as ManagedRole,
  });

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabaseBrowserClient
      .from('users')
      .select('*, profile:user_profiles(*)')
      .order('email');

    if (error) {
      console.error('Failed to load users', error);
      setErrorMessage('Unable to load users.');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Array<{
      id: string;
      email: string;
      role: string | null;
      display_name?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
      profile?: Record<string, unknown> | null;
    }>;

    const mapped: ManagedUser[] = rows.map((row) => {
      const rawProfile = sanitizeProfileRow(row.profile);
      const profileFieldTypes: Record<string, FieldType> = {};
      const profileState: Record<string, string> = {};

      const keys = new Set<string>(baseProfileFieldOrder);
      Object.keys(rawProfile).forEach((key) => keys.add(key));

      keys.forEach((key) => {
        const value = rawProfile[key];
        const type = inferFieldType(key, value);
        profileFieldTypes[key] = type;
        profileState[key] = toInputValue(value, type);
      });

      const profileDisplayName = profileState.display_name ?? '';

      return {
        id: row.id,
        email: row.email,
        role: (row.role ?? 'user') as ManagedRole,
        fullName: profileDisplayName,
        accountDisplayName: row.display_name ?? '',
        createdAt: row.created_at ?? null,
        updatedAt: row.updated_at ?? null,
        profile: profileState,
        profileFieldTypes,
      };
    });

    setUsers(mapped);
    setExpandedUserId(null);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      if (user.email.toLowerCase().includes(query)) return true;
      if (user.fullName?.toLowerCase().includes(query)) return true;
      if (user.accountDisplayName?.toLowerCase().includes(query)) return true;
      return Object.values(user.profile).some((value) =>
        value ? value.toLowerCase().includes(query) : false,
      );
    });
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleStart = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = filteredUsers.length === 0 ? 0 : Math.min(startIndex + PAGE_SIZE, filteredUsers.length);
  const searchActive = searchTerm.trim().length > 0;

  const handleAddUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await addUserAction({
        email: newUser.email,
        display_name: newUser.fullName,
        role: newUser.role,
      });

      if (!result?.success) {
        setErrorMessage(result?.error ?? 'Failed to add user.');
        return;
      }

      setStatusMessage('User added successfully.');
      setNewUser({ email: '', fullName: '', role: 'staff' });
      setCurrentPage(1);
      await loadUsers();
    });
  };

  const updateLocalUser = (
    id: string,
    updates: Partial<ManagedUser> & {
      profile?: Record<string, string>;
      profileFieldTypes?: Record<string, FieldType>;
    },
  ) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) {
          return user;
        }
        return {
          ...user,
          ...updates,
          profile: updates.profile ? { ...user.profile, ...updates.profile } : user.profile,
          profileFieldTypes: updates.profileFieldTypes
            ? { ...user.profileFieldTypes, ...updates.profileFieldTypes }
            : user.profileFieldTypes,
        };
      }),
    );
  };

  const handleSave = (user: ManagedUser) => {
    const trimmedEmail = user.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Email is required.');
      setStatusMessage(null);
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Enter a valid email address.');
      setStatusMessage(null);
      return;
    }

    const sanitizeResult = sanitizeProfileValues(user.profile, user.profileFieldTypes);
    if (!sanitizeResult.ok) {
      setErrorMessage(sanitizeResult.error);
      setStatusMessage(null);
      return;
    }

    const { payload: profilePayload, normalizedValues } = sanitizeResult;
    const trimmedAccountDisplayName = user.accountDisplayName.trim();
    const normalizedFullName = normalizedValues.display_name ?? '';

    updateLocalUser(user.id, {
      email: trimmedEmail,
      accountDisplayName: trimmedAccountDisplayName,
      fullName: normalizedFullName,
      profile: normalizedValues,
    });

    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateUserAction({
        id: user.id,
        user: {
          email: trimmedEmail,
          role: user.role,
          display_name: trimmedAccountDisplayName === '' ? null : trimmedAccountDisplayName,
        },
        profile: profilePayload,
      });

      if (!result?.success) {
        setErrorMessage(result?.error ?? 'Failed to update user.');
        await loadUsers();
        return;
      }

      setStatusMessage('User updated successfully.');
      await loadUsers();
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this user account?')) return;

    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteUserAction(id);

      if (!result?.success) {
        setErrorMessage(result?.error ?? 'Failed to delete user.');
        return;
      }

      setStatusMessage('User deleted successfully.');
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setExpandedUserId((previous) => (previous === id ? null : previous));
    });
  };

  return (
    <main className="space-y-8 text-slate-900 dark:text-slate-100">
      <title>Manage Users | Admin</title>

      <header className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-lg shadow-slate-200 transition-colors dark:border-slate-700 dark:bg-white/95 dark:text-slate-900 dark:shadow-black/40">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-900">User Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-600">
          Invite staff or administrators and maintain their roles for the library checkout system.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 transition-colors dark:border-slate-700 dark:bg-white/95 dark:text-slate-900 dark:shadow-black/30">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-900">Add staff member</h2>
        <form onSubmit={handleAddUser} className="mt-4 grid gap-4 md:grid-cols-[2fr_2fr_1fr_auto]">
            <input
              type="email"
              required
              placeholder="person@swinburne.edu.my"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
            />
            <input
              type="text"
              placeholder="Full name"
              value={newUser.fullName}
              onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
            />
            <select
              className="min-w-[7rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:focus:border-slate-500 dark:focus:ring-slate-400"
              value={newUser.role}
              onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as ManagedRole }))}
            >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow transition disabled:cursor-not-allowed disabled:opacity-70',
              isPending
                ? 'bg-slate-400 text-white'
                : 'bg-swin-red text-white hover:bg-swin-red/90 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800',
            )}
          >
            {isPending ? 'Adding…' : 'Add user'}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Staff and admin must use their Swinburne Outlook email addresses.
        </p>
      </section>

      {(errorMessage || statusMessage) && (
        <div
          className={clsx(
            'rounded-lg border px-4 py-3 text-sm',
            errorMessage
              ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-100'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-100',
          )}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-colors dark:border-slate-700 dark:bg-white/95 dark:text-slate-900 dark:shadow-black/30">
        <header className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 md:flex-row md:items-center md:justify-between dark:border-slate-300">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-900">Current users</h2>
            <span className="text-sm text-slate-500 dark:text-slate-600">
              {loading
                ? 'Loading…'
                : searchActive
                ? `${filteredUsers.length} match${filteredUsers.length === 1 ? '' : 'es'} of ${users.length} account${users.length === 1 ? '' : 's'}`
                : `${filteredUsers.length} account${filteredUsers.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="w-full md:w-72">
            <label className="sr-only" htmlFor="manage-users-search">
              Search users
            </label>
            <input
              id="manage-users-search"
              type="search"
              placeholder="Search by any field"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
            />
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-white text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-white dark:text-slate-700">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Full name</th>
                <th className="px-6 py-3 text-left">Student ID</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-sm dark:divide-slate-200 dark:bg-white dark:text-slate-900">
              {loading ? (
                <tr>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400" colSpan={5}>
                    {searchActive ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <Fragment key={user.id}>
                    <tr key={`${user.id}-row`}>
                    <td className="px-6 py-4">
                      <input
                        type="email"
                        value={user.email}
                        onChange={(event) => updateLocalUser(user.id, { email: event.target.value })}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
                        maxLength={254}
                        autoComplete="off"
                        inputMode="email"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={user.fullName}
                        onChange={(event) =>
                          updateLocalUser(user.id, {
                            fullName: event.target.value,
                            profile: { display_name: event.target.value },
                          })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
                        maxLength={120}
                        autoComplete="name"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={user.profile.student_id ?? ''}
                        onChange={(event) =>
                          updateLocalUser(user.id, { profile: { student_id: event.target.value } })
                        }
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:placeholder-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-400"
                        maxLength={60}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateLocalUser(user.id, { role: event.target.value as ManagedRole })
                        }
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 min-w-[7rem] dark:border-slate-300 dark:bg-white dark:text-slate-900 dark:focus:border-slate-500 dark:focus:ring-slate-400"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedUserId((prev) => (prev === user.id ? null : user.id))}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                        >
                          {expandedUserId === user.id ? 'Hide details' : 'Details'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(user)}
                          disabled={isPending}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          className="rounded-md border border-rose-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500 dark:text-rose-200 dark:hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    </tr>
                    {expandedUserId === user.id && (
                      <tr key={`${user.id}-details`} className="bg-slate-50/60 dark:bg-white/5">
                        <td className="px-6 py-4" colSpan={5}>
                          <UserDetailEditor user={user} onChange={updateLocalUser} isPending={isPending} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length > 0 && (
          <footer className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between dark:border-white/5 dark:text-slate-400">
            <span>
              Showing {visibleStart}-{visibleEnd} of {filteredUsers.length}{' '}
              {searchActive
                ? `match${filteredUsers.length === 1 ? '' : 'es'} (from ${users.length} total)`
                : `user${filteredUsers.length === 1 ? '' : 's'}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-white/20 dark:text-white dark:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </section>
    </main>
  );
}

function UserDetailEditor({
  user,
  onChange,
  isPending,
}: {
  user: ManagedUser;
  onChange: (
    id: string,
    updates: Partial<ManagedUser> & { profile?: Record<string, string> },
  ) => void;
  isPending: boolean;
}) {
  const handleProfileChange = (field: string, value: string) => {
    const updates: Partial<ManagedUser> & { profile?: Record<string, string> } = {
      profile: { [field]: value },
    };

    if (field === 'display_name') {
      updates.fullName = value;
    }

    onChange(user.id, updates);
  };

  const profileKeys = useMemo(() => getProfileKeys(user), [user]);

  const formatDate = (value: string | null) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-200">Account details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300" htmlFor={`${user.id}-account-display-name`}>
              Account display name
            </label>
            <input
              id={`${user.id}-account-display-name`}
              type="text"
              value={user.accountDisplayName}
              onChange={(event) =>
                onChange(user.id, { accountDisplayName: event.target.value })
              }
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
              maxLength={120}
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Created at</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300">Last updated</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:shadow-black/30">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-200">Profile fields</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profileKeys.map((key) => {
            const config = PROFILE_FIELD_CONFIG[key];
            const type = user.profileFieldTypes[key] ?? config?.type ?? 'text';
            const label = config?.label ?? toTitleCase(key);
            const value = user.profile[key] ?? '';

            if (type === 'json' || type === 'textarea') {
              return (
                <div key={key} className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase text-slate-500 dark:text-slate-300" htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <textarea
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    rows={config?.rows ?? 4}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                    placeholder={config?.placeholder}
                    disabled={isPending}
                  />
                  {config?.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
                  )}
                </div>
              );
            }

            if (type === 'select') {
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300" htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <select
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                    disabled={isPending}
                  >
                    <option value="">Not set</option>
                    {(config?.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {config?.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
                  )}
                </div>
              );
            }

            if (type === 'boolean') {
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300" htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <select
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                    disabled={isPending}
                  >
                    <option value="">Not set</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              );
            }

            return (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-300" htmlFor={`${user.id}-${key}`}>
                  {label}
                </label>
                <input
                  id={`${user.id}-${key}`}
                  type={type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(event) => handleProfileChange(key, event.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-300 dark:focus:ring-emerald-300/30"
                  placeholder={config?.placeholder}
                  maxLength={config?.maxLength}
                  disabled={isPending}
                />
                {config?.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

