'use client';

import { useEffect, useState, useTransition } from 'react';
import clsx from 'clsx';
import { supabaseBrowserClient } from '@/app/lib/supabase/client';
import { addUserAction } from '@/app/actions/addUser';
import { updateUserAction } from '@/app/actions/updateUser';
import { deleteUserAction } from '@/app/actions/deleteUser';

type ManagedUser = {
  id: string;
  email: string;
  role: 'user' | 'staff' | 'admin';
  fullName: string;
};

const roleOptions: ManagedUser['role'][] = ['user', 'staff', 'admin'];

export default function UserManagementPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newUser, setNewUser] = useState({ email: '', fullName: '', role: 'staff' as ManagedUser['role'] });

  const loadUsers = async () => {
    setLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabaseBrowserClient
      .from('users')
      .select('id, email, role, profile:user_profiles(display_name)')
      .order('email');

    if (error) {
      setErrorMessage('Unable to load users.');
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Array<{
      id: string;
      email: string;
      role: string | null;
      profile?: { display_name?: string | null } | null;
    }>;

    const mapped: ManagedUser[] = rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: (row.role ?? 'user') as ManagedUser['role'],
      fullName: row.profile?.display_name ?? '',
    }));

    setUsers(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
      await loadUsers();
    });
  };

  const updateLocalUser = (id: string, updates: Partial<ManagedUser>) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...updates } : user)));
  };

  const handleSave = (user: ManagedUser) => {
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await updateUserAction({
        id: user.id,
        display_name: user.fullName,
        role: user.role,
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
    });
  };

  return (
    <main className="space-y-8">
      <title>Manage Users | Admin</title>

      <header className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg shadow-slate-900/30">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Invite staff or administrators and maintain their roles for the library checkout system.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h2 className="text-lg font-semibold text-slate-900">Add staff member</h2>
        <form onSubmit={handleAddUser} className="mt-4 grid gap-4 md:grid-cols-[2fr_2fr_1fr_auto]">
          <input
            type="email"
            required
            placeholder="person@swinburne.edu.my"
            value={newUser.email}
            onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Full name"
            value={newUser.fullName}
            onChange={(event) => setNewUser((prev) => ({ ...prev, fullName: event.target.value }))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            value={newUser.role}
            onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as ManagedUser['role'] }))}
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
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isPending ? 'Adding…' : 'Add user'}
          </button>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Staff and admin must use their Swinburne Outlook email addresses.
        </p>
      </section>

      {(errorMessage || statusMessage) && (
        <div
          className={clsx(
            'rounded-lg border px-4 py-3 text-sm',
            errorMessage
              ? 'border-rose-300 bg-rose-50 text-rose-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700',
          )}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
        <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Current users</h2>
          <span className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${users.length} account${users.length === 1 ? '' : 's'}`}
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Full name</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td className="px-6 py-4 text-slate-500" colSpan={4}>
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 text-slate-500" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{user.email}</td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={user.fullName}
                        onChange={(event) => updateLocalUser(user.id, { fullName: event.target.value })}
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(event) => updateLocalUser(user.id, { role: event.target.value as ManagedUser['role'] })}
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
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
                          onClick={() => handleSave(user)}
                          disabled={isPending}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          className="rounded-md border border-rose-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
