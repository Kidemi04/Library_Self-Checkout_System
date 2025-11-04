"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLibraryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Login successful!");

        // ✅ Redirect based on role
        if (data.user?.role === "staff") {
          window.location.href = "/dashboard/admin";
        } else if (data.user?.role === "student") {
          window.location.href = "/dashboard/student";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setMessage(`❌ ${data.error || "Invalid login credentials"}`);
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message || "Unexpected error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <title>Login</title>

      <Image
        src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844"
        alt="background"
        fill
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />

      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <Link href="/">
          <img
            className="mx-auto scale-125 shadow-lg"
            src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
            alt="Swinburne logo"
          />
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-swin-charcoal">
          Swinburne Sarawak Library
        </h1>
        <p className="mt-2 text-center text-sm text-swin-charcoal/70">
          Choose your login method to access the Library Self-Checkout System.
        </p>

        {/* Microsoft Login */}
        <div className="mt-8 space-y-4">
          <Link
            href="/api/auth/signin/azure-ad"
            prefetch={false}
            className="flex items-center justify-center gap-3 rounded-lg bg-swin-red px-4 py-3 text-sm font-semibold text-swin-ivory shadow transition hover:bg-swin-red/90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path fill="#f25022" d="M11 11H3V3h8z" />
              <path fill="#00a4ef" d="M21 11h-8V3h8z" />
              <path fill="#7fba00" d="M11 21H3v-8h8z" />
              <path fill="#ffb900" d="M21 21h-8v-8h8z" />
            </svg>
            <span>Sign in with Microsoft</span>
          </Link>
        </div>

        {/* Library Login */}
        <form
          onSubmit={handleLibraryLogin}
          className="mt-8 border-t border-gray-300 pt-6 space-y-4"
        >
          <h2 className="text-center font-semibold text-swin-charcoal text-sm">
            OR login with your Library Account
          </h2>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal mb-1">
              Library Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-swin-red outline-none"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-swin-charcoal mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-swin-red outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-swin-red text-white py-2 rounded-md text-sm font-semibold hover:bg-swin-red/90 transition"
          >
            {loading ? "Logging in..." : "Login with Library Account"}
          </button>

          {message && (
            <p
              className={`text-center text-sm mt-2 ${
                message.includes("✅") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
