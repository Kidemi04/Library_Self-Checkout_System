"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePageMobile() {
  return (
    <main className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-swin-ivory text-swin-charcoal transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Image
        src="https://www.swinburne.edu.my/online-application-form/img/header-bg.jpg"
        alt="background"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      <header className="absolute left-0 top-0 flex w-full items-center justify-between bg-white/70 pr-5 text-swin-charcoal shadow dark:bg-slate-950/70 dark:text-white">
        <img
          className="h-15"
          src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
          alt="Swinburne Logo"
        />
        <Link
          href="/login"
          className="rounded bg-swin-red px-5 py-3 text-md font-medium text-white shadow-lg shadow-swin-red/30 transition hover:bg-swin-red/90"
        >
          Log In
        </Link>
      </header>

      <section className="relative flex flex-grow flex-col items-center justify-center px-6 text-center text-white">
        <BookOpenIcon className="mb-4 h-12 w-12 text-white" />
        <h1 className="text-2xl font-bold text-white">Swinburne Library Self-Checkout</h1>
        <p className="mt-3 text-sm text-white/80">
          Borrow and return books anytime with your phone. Quick, simple, and kiosk-free.
        </p>

        <div className="mt-6 flex w-full flex-col gap-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg bg-swin-charcoal px-4 py-3 text-sm font-medium text-swin-ivory shadow transition hover:bg-swin-red"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link
            href="https://www.swinburne.edu.my/"
            target="_blank"
            className="rounded-lg border border-swin-charcoal/30 bg-white px-4 py-3 text-sm text-swin-charcoal transition hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory dark:border-white/40 dark:bg-slate-900/80 dark:text-white dark:hover:bg-swin-red"
          >
            Learn More
          </Link>
        </div>
      </section>

      <footer className="absolute bottom-0 left-0 w-full bg-swin-charcoal py-3 text-center text-[10px] text-swin-ivory/70 dark:bg-black/80">
        © 2025 Swinburne FYP • Group 12
      </footer>
    </main>
  );
}
