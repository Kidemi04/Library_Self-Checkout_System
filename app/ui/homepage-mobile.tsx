"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePageMobile() {
  return (
    <main className="flex min-h-screen flex-col bg-swin-ivory justify-center relative overflow-hidden">
      <Image
        src="https://www.swinburne.edu.my/online-application-form/img/header-bg.jpg"
        alt="background"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      <header className="absolute top-0 left-0 w-full flex items-center justify-between bg-white/70 pr-5 shadow">
        <img
          className="h-15"
          src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
          alt="Swinburne Logo"
        />
        <Link
          href="/login"
          className="rounded bg-swin-red px-5 py-3 text-md font-medium text-white " >
          Log In
        </Link>

        <Link
          href="/register"
          className="rounded bg-white px-5 py-3 text-md font-medium text-swin-red " >
          Sign Up
        </Link>

      </header>


      <section className="relative flex flex-col items-center justify-center flex-grow px-6 text-center">
        <BookOpenIcon className="mb-4 h-12 w-12 text-white" />
        <h1 className="text-2xl font-bold text-white">
          Swinburne Library Self-Checkout
        </h1>
        <p className="mt-3 text-sm text-white/80">
          Borrow and return books anytime with your phone. Quick, simple, and kiosk-free.
        </p>

        {/* 按钮 */}
        <div className="mt-6 flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-lg bg-swin-charcoal px-4 py-3 text-swin-ivory text-sm font-medium shadow hover:bg-swin-red"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            href="https://www.swinburne.edu.my/"
            target="_blank"
            className="rounded-lg border border-swin-charcoal/30 px-4 py-3 text-sm text-swin-charcoal bg-white hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* 底部版权 */}
      <footer className="absolute bottom-0 left-0 w-full bg-swin-charcoal py-3 text-center text-[10px] text-swin-ivory/70">
        © 2025 Swinburne FYP · Group 12
      </footer>
    </main>
  );
}
