"use client";

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading profile...</p>;
  }

  if (!session?.user) {
    return <p>You are not logged in.</p>;
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-100 rounded-xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">My Profile</h1>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {user.name ?? "—"}
          </p>
          <p>
            <span className="font-medium">Email:</span> {user.email ?? "—"}
          </p>
          <p>
            <span className="font-medium">Role:</span>{" "}
            <span
              className={
                user.role === "staff"
                  ? "text-green-700 font-semibold"
                  : "text-blue-700 font-semibold"
              }
            >
              {user.role ?? "student"}
            </span>
          </p>
        </div>
        <p className="text-xs text-slate-500">
          * This role is assigned automatically based on your email.
        </p>
      </div>
    </div>
  );
}
