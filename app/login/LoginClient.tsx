'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import BlurFade from '@/app/ui/magicUi/blurFade';
import GlassCard from '@/app/ui/magicUi/glassCard';

type LoginClientProps = {
  callbackUrl: string;
  hasLinkedIn?: boolean;
};

export default function LoginClient({ callbackUrl, hasLinkedIn }: LoginClientProps) {
  const [pendingMs, setPendingMs] = useState(false);
  const [pendingLi, setPendingLi] = useState(false);

  const handleMicrosoftSignIn = () => {
    if (pendingMs || pendingLi) return;
    setPendingMs(true);
    void signIn('azure-ad', { callbackUrl }, { prompt: 'select_account' }).finally(() => {
      setPendingMs(false);
    });
  };

  const handleLinkedInSignIn = () => {
    if (pendingMs || pendingLi) return;
    setPendingLi(true);
    void signIn('linkedin', { callbackUrl }).finally(() => {
      setPendingLi(false);
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-swin-ivory p-6 dark:bg-slate-950">
      <title>Login</title>

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://aadcdn.msauthimages.net/447973e2-uddq3dansz8dzvbzqaldisw5-z1gjnyitaoanchjrvw/logintenantbranding/0/illustration?ts=636377489049121844"
          alt="background"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
          className="scale-105 blur-sm grayscale-[20%] filter transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Login Card */}
      <BlurFade delay={0.2} yOffset={20}>
        <GlassCard
          intensity="high"
          className="relative w-full max-w-md border-white/20 bg-white/80 p-10 shadow-2xl dark:bg-slate-900/80"
        >
          {/* Logo */}
          <BlurFade delay={0.3} yOffset={10}>
            <Link href="/" className="block transition-transform duration-300 hover:scale-105">
              <img
                className="mx-auto scale-125 drop-shadow-lg"
                src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
                alt="Swinburne logo"
              />
            </Link>
          </BlurFade>

          {/* Title */}
          <BlurFade delay={0.4} yOffset={10}>
            <h1 className="mt-8 text-center text-3xl font-bold text-swin-charcoal dark:text-white">
              Swinburne Sarawak Library
            </h1>
          </BlurFade>

          {/* Sign In Buttons */}
          <BlurFade delay={0.5} yOffset={10}>
            <div className="mt-8 flex flex-col gap-3">
              {/* Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={pendingMs || pendingLi}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-swin-red to-swin-red/90 px-6 py-4 text-sm font-semibold text-swin-ivory shadow-xl shadow-swin-red/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-swin-red/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden="true"
                >
                  <path fill="#f25022" d="M11 11H3V3h8z" />
                  <path fill="#00a4ef" d="M21 11h-8V3h8z" />
                  <path fill="#7fba00" d="M11 21H3v-8h8z" />
                  <path fill="#ffb900" d="M21 21h-8v-8h8z" />
                </svg>
                <span className="relative">
                  {pendingMs ? 'Signing in...' : 'Sign in with Microsoft'}
                </span>
              </button>

              {/* LinkedIn — only rendered when the provider is configured */}
              {hasLinkedIn && (
                <button
                  type="button"
                  onClick={handleLinkedInSignIn}
                  disabled={pendingMs || pendingLi}
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#0A66C2] px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0A66C2]/30 transition-all duration-300 hover:scale-[1.02] hover:bg-[#004182] hover:shadow-2xl hover:shadow-[#0A66C2]/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span className="relative">
                    {pendingLi ? 'Signing in...' : 'Sign in with LinkedIn'}
                  </span>
                </button>
              )}
            </div>
          </BlurFade>
        </GlassCard>
      </BlurFade>
    </main>
  );
}
