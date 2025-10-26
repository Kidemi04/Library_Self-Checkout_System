"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePageDesktop() {
  return (
    <main className="flex min-h-screen flex-col bg-swin-ivory justify-center">
      <link
        rel="icon"
        href='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"/></svg>'
        type="image/svg+xml"
      />
      <title>Main Page</title>

      <Image
        src="https://www.swinburne.edu.my/online-application-form/img/header-bg.jpg"
        alt="background"
        fill
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />

      <div className="absolute inset-0 bg-black/30" />
      <div className="relative">
        {/* Header / Banner */}
        <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white/70 pr-6 text-swin-ivory shadow-lg shadow-swin-charcoal/40">
          <img
            className="h-10 md:h-20"
            src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
            alt="Swinburne Logo"
          />
          <nav className="space-x-6">
            <Link
              href="/login"
              className="rounded-md bg-swin-red px-6 py-3 text-lg font-medium text-white shadow"
            >
              Log In
            </Link>

            {/* External Sign Up link */}
            <a
              href="http://swinburne.librarynet.com.my/Angka.sa2/public/community/online/registration.htm?l=swinburne"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-white px-6 py-3 text-lg font-medium text-swin-red"
            >
              Sign Up
            </a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center flex-grow px-6 py-16 text-center">
          <BookOpenIcon className="mb-6 h-16 w-16 text-white" />
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Welcome to the Swinburne Library Self-Checkout
          </h1>
          <p className="mt-4 max-w-2xl text-white/80 md:text-lg">
            Borrow and return your books anytime, anywhere. Use your device to
            log in, scan your ID and book barcode, and complete transactions
            seamlessly — no need for the old kiosks.
          </p>

          {/* Call-to-actions */}
          <div className="mt-8 flex flex-col gap-4 md:flex-row">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-lg bg-swin-charcoal px-6 py-3 text-swin-ivory font-medium shadow hover:bg-swin-red"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <a
              href="https://www.swinburne.edu.my/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-swin-charcoal/20 px-6 py-3 bg-white text-swin-charcoal hover:border-swin-red hover:bg-swin-red hover:text-swin-ivory"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-swin-charcoal py-4 text-center text-xs text-swin-ivory/70">
          Powered by Group 12 · © 2025 Swinburne Final Year Project
        </footer>
      </div>
    </main>
  );
}
