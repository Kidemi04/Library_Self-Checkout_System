import Link from "next/link";
import { BookOpenIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col bg-slate-50">
            {/* Header / Banner */}
            <title>Main Page</title>
            <header className="flex items-center justify-between bg-blue-600 px-6 py-4">
                <img
                    className="h-10 md:h-14"
                    src="https://www.swinburne.edu.my/wp-content/themes/mytheme-2021/images/logo-long-full.svg"
                    alt="Swinburne Logo" />
                <nav className="space-x-4">
                    <Link
                        href="/login"
                        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow hover:bg-slate-100" >
                    Log In
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center flex-grow px-6 py-16 text-center">
                <BookOpenIcon className="w-16 h-16 text-blue-600 mb-6" />
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
                    Welcome to the Swinburne Library Self-Checkout
                </h1>
                <p className="mt-4 max-w-2xl text-slate-600 md:text-lg">
                Borrow and return your books anytime, anywhere. Use your device to log
                in, scan your ID and book barcode, and complete transactions
                seamlessly — no need for the old kiosks.
                </p>

                {/* Call-to-actions */}
                <div className="mt-8 flex flex-col gap-4 md:flex-row">
                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium shadow hover:bg-blue-700" >
                    <span>Get Started</span>
                    <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                    href="/about"
                    className="rounded-lg border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-100" >
                Learn More
                </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-100 py-4 text-center text-xs text-slate-500">
                Powered by Group 12 · © 2025 Swinburne FYP
            </footer>
        </main>
    );
}
