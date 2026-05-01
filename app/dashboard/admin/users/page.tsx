'use client';

import { Fragment, useEffect, useMemo, useState, useTransition } from 'react';
import clsx from 'clsx';
import { supabaseBrowserClient } from '@/app/lib/supabase/client';
import { addUserAction } from '@/app/actions/addUser';
import { updateUserAction } from '@/app/actions/updateUser';
import { deleteUserAction } from '@/app/actions/deleteUser';
import AdminShell from '@/app/ui/dashboard/adminShell';
import ConfirmModal from '@/app/ui/dashboard/confirmModal';
import RoleBadge from '@/app/ui/dashboard/primitives/RoleBadge';
import UserAvatar from '@/app/ui/dashboard/primitives/UserAvatar';
import { Button } from '@/app/ui/button';

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
  { value: 'public', label: 'Public' },
  { value: 'campus', label: 'Campus' },
  { value: 'private', label: 'Private' },
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
      .from('Users')
      .select('*, profile:UserProfile(*)')
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

    const trimmedEmail = newUser.email.trim().toLowerCase();
    if (!trimmedEmail) return;

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (!trimmedEmail.endsWith('@swinburne.edu.my')) {
      setErrorMessage('Staff and admin accounts must use a @swinburne.edu.my Outlook email address.');
      return;
    }

    setShowAddConfirm(true);
  };

  const confirmAddUser = () => {
    setShowAddConfirm(false);
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

    if ((user.role === 'staff' || user.role === 'admin') && !trimmedEmail.endsWith('@swinburne.edu.my')) {
      setErrorMessage('Staff and admin accounts must use a @swinburne.edu.my Outlook email address.');
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

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [saveTarget, setSaveTarget] = useState<ManagedUser | null>(null);

  const handleDelete = (id: string) => {
    const target = users.find((u) => u.id === id);
    setDeleteTarget({
      id,
      label: target?.fullName || target?.accountDisplayName || target?.email || id,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
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
    <>
      <title>Manage Users | Admin</title>

      <AdminShell
        titleSubtitle="Admin Control Center"
        title="User Management"
        description="Invite staff or administrators and maintain their roles for the library checkout system."
      >
        <div className="space-y-8 text-ink dark:text-on-dark">

      <section className="rounded-card border border-hairline bg-surface-card p-6 dark:border-dark-hairline dark:bg-dark-surface-card">
        <h2 className="font-display text-display-sm text-ink dark:text-on-dark">Add staff member</h2>
        <form onSubmit={handleAddUser} className="mt-4 grid gap-4 md:grid-cols-[2fr_2fr_1fr_auto]">
            <input
              type="email"
              required
              placeholder="person@swinburne.edu.my"
              value={newUser.email}
              onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
              className="h-10 rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
            />
            <input
              type="text"
              placeholder="Full name"
              value={newUser.fullName}
              onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
              className="h-10 rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
            />
            <select
              className="h-10 min-w-[7rem] rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
              value={newUser.role}
              onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as ManagedRole }))}
            >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={isPending} aria-disabled={isPending}>
            {isPending ? 'Adding…' : 'Add User'}
          </Button>
        </form>
        <p className="mt-2 font-sans text-caption text-muted dark:text-on-dark-soft">
          Staff and admin must use their Swinburne Outlook email addresses.
        </p>
      </section>

      {(errorMessage || statusMessage) && (
        <div
          className={clsx(
            'rounded-card border px-4 py-3 font-sans text-body-sm',
            errorMessage
              ? 'border-primary/30 bg-primary/10 text-primary dark:text-dark-primary'
              : 'border-success/30 bg-success/10 text-success',
          )}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-card border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card">
        <header className="flex flex-col gap-4 border-b border-hairline-soft px-6 py-5 md:flex-row md:items-center md:justify-between dark:border-dark-hairline">
          <div>
            <h2 className="font-display text-display-md text-ink dark:text-on-dark">Current users</h2>
            <p className="mt-0.5 font-mono text-[11px] text-muted dark:text-on-dark-soft">
              {loading
                ? 'Loading…'
                : searchActive
                ? `${filteredUsers.length} match${filteredUsers.length === 1 ? '' : 'es'} of ${users.length} account${users.length === 1 ? '' : 's'}`
                : `${filteredUsers.length} account${filteredUsers.length === 1 ? '' : 's'}`}
            </p>
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
              className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
            />
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="hidden min-w-full divide-y divide-hairline-soft md:table dark:divide-dark-hairline">
            <thead className="bg-surface-cream-strong font-sans text-caption-uppercase text-ink dark:bg-dark-surface-strong dark:text-on-dark">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Full name</th>
                <th className="px-6 py-3 text-left">Student ID</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft font-sans text-body-sm text-ink dark:divide-dark-hairline dark:text-on-dark">
              {loading ? (
                <tr>
                  <td className="px-6 py-4 text-muted dark:text-on-dark-soft" colSpan={5}>
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-muted dark:text-on-dark-soft" colSpan={5}>
                    {searchActive ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <Fragment key={user.id}>
                    <tr key={`${user.id}-row`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={user.fullName || user.accountDisplayName || user.email}
                          size="md"
                          tone={user.role === 'admin' ? 'red' : user.role === 'staff' ? 'gold' : 'charcoal'}
                        />
                        <input
                          type="email"
                          value={user.email}
                          onChange={(event) => updateLocalUser(user.id, { email: event.target.value })}
                          className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
                          maxLength={254}
                          autoComplete="off"
                          inputMode="email"
                        />
                      </div>
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
                        className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
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
                        className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:placeholder:text-on-dark-soft dark:focus-visible:ring-offset-dark-canvas"
                        maxLength={60}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <RoleBadge role={user.role} />
                        <select
                          value={user.role}
                          onChange={(event) =>
                            updateLocalUser(user.id, { role: event.target.value as ManagedRole })
                          }
                          className="rounded-btn border border-hairline bg-canvas px-2.5 py-1.5 font-sans text-caption text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
                          aria-label="Change role"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedUserId((prev) => (prev === user.id ? null : user.id))}
                          className="rounded-btn border border-hairline bg-canvas px-3 py-1 font-sans text-caption font-semibold uppercase tracking-wide text-ink transition hover:border-primary/20 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
                        >
                          {expandedUserId === user.id ? 'Hide details' : 'Details'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaveTarget(user)}
                          disabled={isPending}
                          className="rounded-btn border border-hairline bg-canvas px-3 py-1 font-sans text-caption font-semibold uppercase tracking-wide text-ink transition hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          className="rounded-btn border border-primary/30 px-3 py-1 font-sans text-caption font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-primary/30 dark:text-dark-primary dark:hover:bg-dark-primary/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    </tr>
                    {expandedUserId === user.id && (
                      <tr key={`${user.id}-details`} className="bg-surface-cream-strong/50 dark:bg-dark-surface-strong/40">
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

          {/* Mobile View: Card-based layout */}
          <div className="divide-y divide-hairline-soft bg-surface-card dark:divide-dark-hairline dark:bg-dark-surface-card md:hidden">
            {loading ? (
              <div className="p-4 text-center font-sans text-body-sm text-muted dark:text-on-dark-soft">Loading users…</div>
            ) : (
              paginatedUsers.map((user) => (
                <div key={user.id} className="space-y-4 p-4">

                  {/* Identity row */}
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={user.fullName || user.accountDisplayName || user.email}
                      size="lg"
                      tone={user.role === 'admin' ? 'red' : user.role === 'staff' ? 'gold' : 'charcoal'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-title-md text-ink dark:text-on-dark">
                        {user.fullName || user.accountDisplayName || 'Unnamed user'}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted dark:text-on-dark-soft">
                        {user.email}
                      </p>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>

                  {/* Header Grid: Aligns Name and Role on the same horizontal line */}
                  <div className="grid grid-cols-12 items-end gap-3">
                    <div className="col-span-8">
                      <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-muted-soft dark:text-on-dark-soft">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.fullName}
                        onChange={(e) => updateLocalUser(user.id, {
                          fullName: e.target.value,
                          profile: { display_name: e.target.value },
                        })}
                        className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="mb-1 block text-right font-sans text-[10px] font-bold uppercase tracking-wider text-muted-soft dark:text-on-dark-soft">
                        Role
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => updateLocalUser(user.id, { role: e.target.value as ManagedRole })}
                        className="h-10 w-full rounded-btn border border-hairline bg-canvas px-2 font-sans text-body-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Email Section: Full width below Name/Role */}
                  <div>
                    <label className="mb-1 block font-sans text-[10px] font-bold uppercase tracking-wider text-muted-soft dark:text-on-dark-soft">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => updateLocalUser(user.id, { email: e.target.value })}
                      className="h-10 w-full rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink placeholder:text-muted-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas"
                    />
                  </div>

                  {/* Action Buttons: Uniform heights and spacing */}
                  <div className="flex gap-2 border-t border-hairline-soft pt-2 dark:border-dark-hairline">
                    <button
                      onClick={() => setExpandedUserId((prev) => (prev === user.id ? null : user.id))}
                      className="flex-1 rounded-btn border border-hairline bg-canvas py-2 font-sans text-caption font-semibold uppercase text-ink hover:border-primary/20 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
                    >
                      {expandedUserId === user.id ? 'Hide' : 'Details'}
                    </button>
                    <button
                      onClick={() => handleSave(user)}
                      disabled={isPending}
                      className="flex-1 rounded-btn bg-primary py-2 font-sans text-caption font-semibold uppercase text-on-primary transition hover:bg-primary-active disabled:opacity-50 dark:bg-dark-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={isPending}
                      className="rounded-btn border border-primary/30 px-3 py-2 font-sans text-caption font-semibold uppercase text-primary hover:bg-primary/5 dark:border-dark-primary/30 dark:text-dark-primary dark:hover:bg-dark-primary/10"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Expandable Detail Panel */}
                  {expandedUserId === user.id && (
                    <div className="mt-2 rounded-card border border-hairline-soft bg-surface-cream-strong/50 p-3 dark:border-dark-hairline dark:bg-dark-surface-strong/40">
                      <UserDetailEditor user={user} onChange={updateLocalUser} isPending={isPending} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {!loading && filteredUsers.length > 0 && (
          <footer className="flex flex-col gap-3 border-t border-hairline-soft px-6 py-4 font-sans text-body-sm text-muted md:flex-row md:items-center md:justify-between dark:border-dark-hairline dark:text-on-dark-soft">
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
                className="rounded-btn border border-hairline bg-canvas px-3 py-1 font-sans text-caption font-semibold uppercase tracking-wide text-ink transition hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
              >
                Previous
              </button>
              <span className="font-sans text-caption font-medium text-muted dark:text-on-dark-soft">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-btn border border-hairline bg-canvas px-3 py-1 font-sans text-caption font-semibold uppercase tracking-wide text-ink transition hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
              >
                Next
              </button>
            </div>
          </footer>
        )}
      </section>

      {/* Add user confirmation modal */}
      <ConfirmModal
        isOpen={showAddConfirm}
        type="info"
        title="Add new user?"
        message={`You are about to create an account for "${newUser.email}" with the role "${newUser.role}". Proceed?`}
        confirmText="Yes, add user"
        cancelText="Go back"
        onConfirm={confirmAddUser}
        onCancel={() => setShowAddConfirm(false)}
      />

      {/* Save user confirmation modal */}
      <ConfirmModal
        isOpen={saveTarget !== null}
        type="info"
        title="Save changes?"
        message={`You are about to update the account for "${saveTarget?.email ?? ''}". This will overwrite the current details.`}
        confirmText="Yes, save changes"
        cancelText="Go back"
        onConfirm={() => {
          if (saveTarget) {
            handleSave(saveTarget);
            setSaveTarget(null);
          }
        }}
        onCancel={() => setSaveTarget(null)}
      />

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm dark:bg-dark-canvas/70">
          <div className="w-full max-w-sm rounded-card border border-hairline bg-surface-card p-6 shadow-[0_4px_16px_rgba(20,20,19,0.08)] dark:border-dark-hairline dark:bg-dark-surface-card">
            {/* Icon */}
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 dark:bg-dark-primary/15">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-primary dark:text-dark-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>

            <h3 className="text-left font-sans text-title-md font-semibold text-ink dark:text-on-dark">
              Delete user account?
            </h3>
            <p className="mt-2 text-left font-sans text-body-sm text-muted dark:text-on-dark-soft">
              You are about to permanently delete{' '}
              <span className="font-medium text-ink dark:text-on-dark">
                {deleteTarget.label}
              </span>
              . This cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-btn border border-hairline bg-canvas px-4 py-2.5 font-sans text-button text-ink transition hover:border-primary/20 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:hover:border-dark-primary/30 dark:hover:text-dark-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 rounded-btn bg-primary px-4 py-2.5 font-sans text-button text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-primary"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </AdminShell>
    </>
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

  const inputClass =
    'h-10 rounded-btn border border-hairline bg-canvas px-3.5 font-sans text-body-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas';
  const textareaClass =
    'w-full rounded-btn border border-hairline bg-canvas px-3.5 py-2 font-sans text-body-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas dark:border-dark-hairline dark:bg-dark-surface-soft dark:text-on-dark dark:focus-visible:ring-offset-dark-canvas';
  const labelClass =
    'font-sans text-caption-uppercase text-muted dark:text-on-dark-soft';

  return (
    <div className="space-y-6">
      <div className="rounded-card border border-hairline bg-surface-card p-4 dark:border-dark-hairline dark:bg-dark-surface-card">
        <h3 className="font-sans text-caption-uppercase font-semibold text-muted dark:text-on-dark-soft">Account details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className={labelClass} htmlFor={`${user.id}-account-display-name`}>
              Account display name
            </label>
            <input
              id={`${user.id}-account-display-name`}
              type="text"
              value={user.accountDisplayName}
              onChange={(event) =>
                onChange(user.id, { accountDisplayName: event.target.value })
              }
              className={inputClass}
              maxLength={120}
            />
          </div>
          <div>
            <p className={labelClass}>Created at</p>
            <p className="font-sans text-body-sm text-body dark:text-on-dark-soft">{formatDate(user.createdAt)}</p>
          </div>
          <div>
            <p className={labelClass}>Last updated</p>
            <p className="font-sans text-body-sm text-body dark:text-on-dark-soft">{formatDate(user.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-hairline bg-surface-card p-4 dark:border-dark-hairline dark:bg-dark-surface-card">
        <h3 className="font-sans text-caption-uppercase font-semibold text-muted dark:text-on-dark-soft">Profile fields</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profileKeys.map((key) => {
            const config = PROFILE_FIELD_CONFIG[key];
            const type = user.profileFieldTypes[key] ?? config?.type ?? 'text';
            const label = config?.label ?? toTitleCase(key);
            const value = user.profile[key] ?? '';

            if (type === 'json' || type === 'textarea') {
              return (
                <div key={key} className="md:col-span-2">
                  <label className={`mb-1 block ${labelClass}`} htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <textarea
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    rows={config?.rows ?? 4}
                    className={textareaClass}
                    placeholder={config?.placeholder}
                    disabled={isPending}
                  />
                  {config?.description && (
                    <p className="mt-1 font-sans text-caption text-muted dark:text-on-dark-soft">{config.description}</p>
                  )}
                </div>
              );
            }

            if (type === 'select') {
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className={labelClass} htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <select
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    className={inputClass}
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
                    <p className="font-sans text-caption text-muted dark:text-on-dark-soft">{config.description}</p>
                  )}
                </div>
              );
            }

            if (type === 'boolean') {
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className={labelClass} htmlFor={`${user.id}-${key}`}>
                    {label}
                  </label>
                  <select
                    id={`${user.id}-${key}`}
                    value={value}
                    onChange={(event) => handleProfileChange(key, event.target.value)}
                    className={inputClass}
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
                <label className={labelClass} htmlFor={`${user.id}-${key}`}>
                  {label}
                </label>
                <input
                  id={`${user.id}-${key}`}
                  type={type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(event) => handleProfileChange(key, event.target.value)}
                  className={inputClass}
                  placeholder={config?.placeholder}
                  maxLength={config?.maxLength}
                  disabled={isPending}
                />
                {config?.description && (
                  <p className="font-sans text-caption text-muted dark:text-on-dark-soft">{config.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

