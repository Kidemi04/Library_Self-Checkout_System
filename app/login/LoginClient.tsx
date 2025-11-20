'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import GlassCard from '@/app/ui/magic-ui/glass-card';

type LoginClientProps = {
  callbackUrl: string;
};

export default function LoginClient({ callbackUrl }: LoginClientProps) {
  const [pending, setPending] = useState(false);

  const handleSignIn = () => {
    if (pending) return;
    setPending(true);
    void signIn('azure-ad', { callbackUrl }).finally(() => {
      setPending(false);
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

          {/* Description */}
          <BlurFade delay={0.5} yOffset={10}>
            <p className="mt-3 text-center text-sm leading-relaxed text-swin-charcoal/70 dark:text-slate-300">
              Sign in with your Swinburne Microsoft account to access the borrow-and-return dashboard.
            </p>
          </BlurFade>

          {/* Sign In Button */}
          <BlurFade delay={0.6} yOffset={10}>
            <div className="mt-8 space-y-4">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={pending}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-swin-red to-swin-red/90 px-6 py-4 text-sm font-semibold text-swin-ivory shadow-xl shadow-swin-red/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-swin-red/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
              >
                {/* Shimmer effect on hover */}
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
                <span className="relative">{pending ? 'Signing in...' : 'Sign in with Microsoft'}</span>
              </button>

              <p className="text-center text-xs leading-relaxed text-swin-charcoal/60 dark:text-slate-400">
                Local development can bypass authentication when enabled. In production you must sign in
                with your Swinburne Microsoft account.
              </p>
            </div>
          </BlurFade>
        </GlassCard>
      </BlurFade>
    </main>
  );
}
