"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import BlurFade from "@/app/ui/magic-ui/blur-fade";
import ShimmerButton from "@/app/ui/magic-ui/shimmer-button";
import GlassCard from "@/app/ui/magic-ui/glass-card";

export default function HomePageDesktop() {
  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-swin-ivory text-swin-charcoal transition-colors dark:bg-slate-950 dark:text-slate-100">
      <link
        rel="icon"
        href='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>'
        type="image/svg+xml"
      />
      <title>Main Page</title>

      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://www.swinburne.edu.my/online-application-form/img/header-bg.jpg"
          alt="background"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          className="scale-105 blur-sm grayscale-[20%] filter transition-all duration-1000 ease-out hover:scale-100 hover:blur-0"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Header */}
      <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-8 py-6">
        <BlurFade delay={0.1} yOffset={-10}>
          <Link href="/">
            <img
              className="h-8 w-auto md:h-10"
              src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
              alt="Swinburne Logo"
            />
          </Link>
        </BlurFade>

        <BlurFade delay={0.2} yOffset={-10}>
          <Link href="/login">
            <ShimmerButton className="h-10 px-6 text-sm font-medium shadow-lg">
              Log In
            </ShimmerButton>
          </Link>
        </BlurFade>
      </header>

      {/* Main Content */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <GlassCard intensity="medium" className="max-w-4xl p-12 md:p-16 border-white/10 bg-black/20 shadow-2xl backdrop-blur-xl">
          <BlurFade delay={0.3}>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-swin-red/20 p-4 ring-1 ring-swin-red/50">
                <BookOpenIcon className="h-12 w-12 text-swin-red" />
              </div>
            </div>
          </BlurFade>

          <BlurFade delay={0.4}>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
              Library Self-Checkout
            </h1>
          </BlurFade>

          <BlurFade delay={0.5}>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl">
              Experience the future of borrowing. Seamlessly check out books with your device -- fast, secure, and kiosk-free.
            </p>
          </BlurFade>

          <BlurFade delay={0.6}>
            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              <Link href="/login">
                <ShimmerButton className="h-14 px-8 text-lg font-semibold shadow-xl shadow-swin-red/20">
                  <span className="flex items-center gap-2">
                    Get Started <ArrowRightIcon className="h-5 w-5" />
                  </span>
                </ShimmerButton>
              </Link>

              <Link
                href="https://www.swinburne.edu.my/"
                target="_blank"
                className="group flex h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                Learn More
              </Link>
            </div>
          </BlurFade>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 w-full text-center">
        <BlurFade delay={0.8}>
          <Link
            href="/about-page"
            className="text-xs font-semibold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
          >
            Powered by Group 12 • © 2025 Swinburne Final Year Project
          </Link>
        </BlurFade>
      </footer>
    </main>
  );
}
