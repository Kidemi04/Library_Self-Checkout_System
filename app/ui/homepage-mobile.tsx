"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import BlurFade from "@/app/ui/magic-ui/blur-fade";
import ShimmerButton from "@/app/ui/magic-ui/shimmer-button";
import GlassCard from "@/app/ui/magic-ui/glass-card";

export default function HomePageMobile() {
  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-swin-ivory text-swin-charcoal transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.swinburne.edu.my/online-application-form/img/header-bg.jpg"
          alt="background"
          fill
          sizes="100vw"
          className="object-cover blur-[2px] brightness-[0.6]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      </div>

      {/* Header */}
      <header className="absolute left-0 top-0 z-50 flex w-full items-center justify-between p-5">
        <BlurFade delay={0.1} yOffset={-10}>
          <Link href="/">
            <img
              className="h-8 w-auto"
              src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
              alt="Swinburne Logo"
            />
          </Link>
        </BlurFade>

        <BlurFade delay={0.2} yOffset={-10}>
          <Link href="/login">
            <ShimmerButton className="h-9 px-4 text-xs font-medium shadow-lg" borderRadius="999px">
              Log In
            </ShimmerButton>
          </Link>
        </BlurFade>
      </header>

      {/* Main Content */}
      <section className="relative z-10 flex flex-grow flex-col items-center justify-center px-6 text-center">
        <GlassCard intensity="medium" className="w-full max-w-sm p-8 border-white/10 bg-black/20 shadow-2xl backdrop-blur-xl">
          <BlurFade delay={0.3}>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-swin-red/20 p-3 ring-1 ring-swin-red/50">
                <BookOpenIcon className="h-10 w-10 text-swin-red" />
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <h1 className="mb-3 text-2xl font-bold text-white">
              Swinburne Library <br /> Self-Checkout
            </h1>
          </BlurFade>

          <BlurFade delay={0.5}>
            <p className="mb-6 text-sm text-white/80">
              Borrow and return books anytime with your phone. Quick, simple, and kiosk-free.
            </p>
          </BlurFade>

          <BlurFade delay={0.6}>
            <div className="flex w-full flex-col gap-3">
              <Link href="/login" className="w-full">
                <ShimmerButton className="h-12 w-full text-base font-semibold shadow-lg shadow-swin-red/20">
                  <span className="flex items-center justify-center gap-2">
                    Get Started <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </ShimmerButton>
              </Link>

              <Link
                href="https://www.swinburne.edu.my/"
                target="_blank"
                className="flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm font-medium text-white backdrop-blur-sm transition active:scale-95 active:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </BlurFade>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 w-full text-center z-10">
        <BlurFade delay={0.8}>
          <p className="text-[10px] text-white/40">
            © 2025 Swinburne FYP • Group 12
          </p>
        </BlurFade>
      </footer>
    </main>
  );
}
