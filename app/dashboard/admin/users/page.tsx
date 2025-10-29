"use client";

import { addUserAction } from "@/app/actions/addUser";
import { updateUserAction } from "@/app/actions/updateUser";
import { deleteUserAction } from "@/app/actions/deleteUser";
import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/app/lib/supabase/client";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    display_name: "",
    role: "student",
  });

  const [currentUser, setCurrentUser] = useState<{
    email: string | null;
    role: string | null;
  }>({ email: null, role: null });

  // 🔹 Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    console.log("🧪 Fetching users from Supabase...");

    try {
      const { data, error } = await supabaseBrowserClient
        .from("users")
        .select("id, email, display_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("✅ Users fetched successfully:", data);
      setUsers(data || []);
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch current logged-in user's email and role
  const fetchCurrentUser = async () => {
    try {
      const { data: sessionData } = await supabaseBrowserClient.auth.getSession();
      const userEmail = sessionData.session?.user?.email || null;

      // 🧩 DEV BYPASS (for local development)
      if (!userEmail) {
        console.warn("⚠️ No Supabase session found — using dev bypass account");
        setCurrentUser({ email: "dev.staff@example.com", role: "staff" });
        return;
      }

      // 🧠 Example.com emails treated as staff automatically
      if (userEmail.endsWith("@example.com")) {
        console.log("🧩 Example.com email detected — assigning staff role.");
        setCurrentUser({ email: userEmail, role: "staff" });
        return;
      }

      // 🗃️ Otherwise, get user's role from the table
      const { data: userData, error } = await supabaseBrowserClient
        .from("users")
        .select("role")
        .eq("email", userEmail)
        .single();

      if (error) {
        console.warn("⚠️ User not found in 'users' table:", error);
        setCurrentUser({ email: userEmail, role: null });
      } else {
        console.log("✅ User role fetched:", userData.role);
        setCurrentUser({ email: userEmail, role: userData?.role || null });
      }
    } catch (err) {
      console.error("🔥 Fatal error fetching session:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  // 🔹 Add user handler
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      alert("Email is required!");
      return;
    }

    setAdding(true);
    console.log("📤 Adding new user:", formData);

    const result = await addUserAction(formData);
    setAdding(false);

    if (!result.success) {
      alert("❌ Failed to add user: " + result.error);
    } else {
      alert("✅ User added successfully!");
      setFormData({ email: "", display_name: "", role: "student" });
      fetchUsers();
    }
  };

  // 🔹 Edit user handler (update)
  const handleEditUser = async (user: any) => {
    const newDisplayName = prompt("Enter new display name:", user.display_name || "");
    const newRole = prompt("Enter new role (student/staff):", user.role || "student");

    if (!newDisplayName && !newRole) return alert("No changes made.");

  const result = await updateUserAction({
    id: user.id,
    display_name: newDisplayName ?? user.display_name, // convert null → existing name
    role: newRole ?? user.role,                        // convert null → existing role
  });

    if (!result.success) {
      alert("❌ Failed to update user: " + result.error);
    } else {
      alert("✅ User updated successfully!");
      fetchUsers();
    }
  };

  // 🔹 Delete user handler
  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const result = await deleteUserAction(id);

    if (!result.success) {
      alert("❌ Failed to delete user: " + result.error);
    } else {
      alert("✅ User deleted successfully!");
      fetchUsers();
    }
  };

  // 🕒 Loading / error handling
  if (loading) return <p className="p-8 text-swin-ivory">Loading users...</p>;
  if (error) return <p className="p-8 text-red-400">❌ {error}</p>;

  // ⚙️ Main render
  return (
    <main className="p-8 space-y-8 text-swin-ivory">
      <h1 className="text-2xl font-bold">User Management</h1>

      {/* Logged in user info */}
      {currentUser.email && (
        <p className="text-swin-ivory/70 text-sm">
          Logged in as: <span className="font-semibold">{currentUser.email}</span> (
          {currentUser.role || "unknown"})
        </p>
      )}

      {/* ➕ Add User Form — only for staff */}
      {currentUser.role === "staff" && (
        <form
          onSubmit={addUser}
          className="flex flex-col md:flex-row items-start md:items-end gap-3 bg-swin-charcoal/60 p-4 rounded-md shadow-md border border-swin-ivory/20"
        >
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-sm font-semibold mb-1 text-swin-ivory">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@swinburne.edu.my"
              className="border border-swin-ivory/30 bg-transparent text-swin-ivory rounded px-3 py-2 text-sm placeholder-swin-ivory/50 focus:border-swin-red outline-none"
              required
            />
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-semibold mb-1 text-swin-ivory">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              placeholder="Full name"
              className="border border-swin-ivory/30 bg-transparent text-swin-ivory rounded px-3 py-2 text-sm placeholder-swin-ivory/50 focus:border-swin-red outline-none"
            />
          </div>

          <div className="flex flex-col w-full md:w-1/4">
            <label className="text-sm font-semibold mb-1 text-swin-ivory">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border border-swin-ivory/30 bg-transparent text-swin-ivory rounded px-3 py-2 text-sm focus:border-swin-red outline-none"
            >
              <option value="student" className="text-black">
                Student
              </option>
              <option value="staff" className="text-black">
                Staff
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="bg-swin-red text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-swin-red/90"
          >
            {adding ? "Adding..." : "Add User"}
          </button>
        </form>
      )}

      {/* 📋 Users Table */}
      <table className="w-full border-collapse border border-swin-ivory/30 text-swin-ivory">
        <thead className="bg-swin-charcoal/80">
          <tr>
            <th className="border border-swin-ivory/20 p-2 text-left">Email</th>
            <th className="border border-swin-ivory/20 p-2 text-left">Display Name</th>
            <th className="border border-swin-ivory/20 p-2 text-left">Role</th>
            <th className="border border-swin-ivory/20 p-2 text-left">Created At</th>
            <th className="border border-swin-ivory/20 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id} className="hover:bg-swin-charcoal/50 transition">
                <td className="border border-swin-ivory/20 p-2">{u.email}</td>
                <td className="border border-swin-ivory/20 p-2">{u.display_name || "—"}</td>
                <td
                  className={`border border-swin-ivory/20 p-2 font-semibold ${
                    u.role === "staff" ? "text-red-400" : "text-blue-400"
                  }`}
                >
                  {u.role}
                </td>
                <td className="border border-swin-ivory/20 p-2">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="border border-swin-ivory/20 p-2 space-x-2">
                  {currentUser.role === "staff" ? (
                    <>
                      <button
                        onClick={() => handleEditUser(u)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">View only</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-swin-ivory/70 py-6 italic">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
