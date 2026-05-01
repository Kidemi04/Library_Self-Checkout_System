'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import BlurFade from '@/app/ui/magicUi/blurFade';
import GlassCard from '@/app/ui/magicUi/glassCard';

type LoginClientProps = {
  callbackUrl: string;
};

export default function LoginClient({ callbackUrl }: LoginClientProps) {
  const [pending, setPending] = useState(false);

  const handleSignIn = () => {
    if (pending) return;
    setPending(true);
    void signIn('azure-ad', { callbackUrl }, { prompt: 'select_account' }).finally(() => {
      setPending(false);
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-6 dark:bg-dark-canvas">
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
          className="relative w-full max-w-md border-on-dark/20 bg-canvas/80 p-10 shadow-2xl dark:bg-dark-surface-card/80"
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
            <h1 className="mt-8 text-center font-display text-display-xl tracking-tight text-ink dark:text-on-dark">
              Swinburne Sarawak Library
            </h1>
          </BlurFade>

          {/* Sign In Button */}
          <BlurFade delay={0.5} yOffset={10}>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={pending}
                className="flex w-full items-center justify-center gap-3 rounded-btn bg-primary px-6 py-4 font-sans text-button text-on-primary transition-colors hover:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted dark:bg-dark-primary dark:hover:bg-primary-active dark:focus-visible:ring-offset-dark-canvas"
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
                <span>{pending ? 'Signing in...' : 'Sign in with Microsoft'}</span>
              </button>
            </div>
          </BlurFade>
        </GlassCard>
      </BlurFade>
    </main>
  );
}
