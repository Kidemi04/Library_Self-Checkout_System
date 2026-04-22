'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  QrCodeIcon,
  BookOpenIcon,
  BookmarkIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { Loan } from '@/app/lib/supabase/types';
import type { PatronHold } from '@/app/lib/supabase/queries';
import LoanCard from '@/app/ui/dashboard/primitives/LoanCard';
import HoldCard from '@/app/ui/dashboard/primitives/HoldCard';
import BookCover, { getBookGradient } from '@/app/ui/dashboard/primitives/BookCover';
import ScanCtaButton from '@/app/ui/dashboard/primitives/ScanCtaButton';
import BlurFade from '@/app/ui/magicUi/blurFade';
import { useTheme } from '@/app/ui/theme/themeProvider';

type StudentDashboardProps = {
  userName: string | null;
  activeLoans: Loan[];
  holds: PatronHold[];
};

const SAMPLE_RECS = [
  { id: 'R1', title: 'Sapiens', author: 'Yuval Noah Harari', reason: 'Based on your history' },
  { id: 'R2', title: 'The Pragmatic Programmer', author: 'Hunt & Thomas', reason: 'Popular in ICT' },
  { id: 'R3', title: 'Deep Work', author: 'Cal Newport', reason: 'Trending this week' },
  { id: 'R4', title: 'Clean Code', author: 'Robert C. Martin', reason: 'Highly rated' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName: string | null): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0] ?? fullName;
}

export default function StudentDashboard({ userName, activeLoans, holds }: StudentDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const urgentLoans = activeLoans.filter(l => {
    const daysLeft = Math.ceil((new Date(l.dueAt).getTime() - Date.now()) / 86400000);
    return daysLeft <= 3;
  });
  const overdueLoans = activeLoans.filter(l =>
    l.status === 'overdue' || new Date(l.dueAt).getTime() < Date.now()
  );
  const readyHolds = holds.filter(h => h.status === 'ready');
  const sortedHolds = [...holds].sort((a, b) => (a.status === 'ready' ? -1 : 1) - (b.status === 'ready' ? -1 : 1));

  const firstName = getFirstName(userName);
  const greeting = getGreeting();

  return (
    <div className={`flex min-h-screen flex-col ${isDark ? 'bg-swin-dark-bg text-white' : 'bg-slate-50 text-swin-charcoal'}`}>

      {/* ========= MOBILE LAYOUT (hidden on md+) ========= */}
      <div className="md:hidden flex flex-col pb-24">
        {/* Hero */}
        <BlurFade delay={0.05} yOffset={10}>
          <div className="px-5 pb-6 pt-5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="mb-3">
                  <Image
                    src="/swinburne-logo.png"
                    alt="Swinburne University of Technology Sarawak Campus"
                    width={140}
                    height={65}
                    className="rounded-sm"
                    priority
                  />
                </div>
                <p className="font-display text-[32px] font-[500] leading-none tracking-tight">
                  {greeting},
                </p>
                <p className="font-display text-[32px] font-[500] italic leading-none tracking-tight text-swin-red">
                  {firstName}.
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-swin-charcoal/10 bg-white text-swin-charcoal/70 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/60"
              >
                {isDark ? '☀' : '☾'}
              </button>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-swin-charcoal/10 bg-white p-4 dark:border-white/10 dark:bg-swin-dark-surface">
              <div className="flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-swin-charcoal/40 dark:text-white/40">Borrowed</p>
                <p className="mt-0.5 font-display text-[26px] font-semibold leading-none tracking-tight">
                  {activeLoans.length}
                  <span className="ml-1 font-sans text-[13px] font-normal text-swin-charcoal/50 dark:text-white/50">books</span>
                </p>
              </div>
              <div className="h-8 w-px bg-swin-charcoal/10 dark:bg-white/10" />
              <div className="flex-1">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-swin-charcoal/40 dark:text-white/40">Due soon</p>
                <p className={`mt-0.5 font-display text-[26px] font-semibold leading-none tracking-tight ${urgentLoans.length > 0 ? 'text-swin-red' : ''}`}>
                  {urgentLoans.length}
                  {overdueLoans.length > 0 && (
                    <span className="ml-1.5 font-mono text-[11px] font-semibold text-swin-red">· {overdueLoans.length} late</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </BlurFade>

        {/* Primary scan CTA */}
        <BlurFade delay={0.1} yOffset={10}>
          <div className="px-5 pb-5">
            <ScanCtaButton
              href="/dashboard/book/checkout"
              variant="red"
              size="sm"
              eyebrow="Self-Checkout"
              title="Scan a book"
              icon={QrCodeIcon}
            />
          </div>
        </BlurFade>

        {/* Quick actions */}
        <BlurFade delay={0.15} yOffset={10}>
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-7">
            {[
              { icon: BookOpenIcon, label: 'Browse', sub: 'Catalogue', href: '/dashboard/book/items' },
              { icon: BookmarkIcon, label: 'Reserve', sub: 'Place a hold', href: '/dashboard/book/items' },
            ].map(q => (
              <Link
                key={q.label}
                href={q.href}
                className="flex flex-col gap-2.5 rounded-[14px] border border-swin-charcoal/10 bg-white p-4 dark:border-white/10 dark:bg-swin-dark-surface"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-swin-gold/12 text-swin-gold dark:bg-swin-gold/15 dark:text-yellow-300">
                  <q.icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold tracking-tight">{q.label}</p>
                  <p className="mt-0.5 text-[12px] text-swin-charcoal/45 dark:text-white/45">{q.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </BlurFade>

        {/* Pickup-ready banner */}
        {readyHolds.length > 0 && (
          <BlurFade delay={0.2} yOffset={10}>
            <div className="mx-5 mb-6">
              <Link
                href="/dashboard/my-books?tab=reservations"
                className="flex items-center gap-3 rounded-[14px] bg-swin-red p-3.5 text-white"
                style={{ boxShadow: '0 8px 24px rgba(200,35,51,0.25)' }}
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/18">
                  <BookmarkIcon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[1.4px] opacity-85">
                    {readyHolds.length > 1 ? `${readyHolds.length} holds ready · ` : 'Ready for pickup · '}
                    {readyHolds[0]?.expiresAt
                      ? `pickup by ${new Date(readyHolds[0].expiresAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}`
                      : 'pick up soon'}
                  </p>
                  <p className="truncate font-display text-[16px] font-semibold leading-tight tracking-tight">
                    {readyHolds[0]?.title}
                  </p>
                </div>
                <ArrowRightIcon className="h-4.5 w-4.5 flex-shrink-0 opacity-80" />
              </Link>
            </div>
          </BlurFade>
        )}

        {/* Currently reading */}
        <BlurFade delay={0.25} yOffset={10}>
          <div className="mb-3.5 flex items-baseline justify-between px-5">
            <h2 className="font-display text-[22px] font-semibold tracking-tight">Currently reading</h2>
            <Link href="/dashboard/my-books" className="flex items-center gap-1 text-[12px] text-swin-charcoal/50 dark:text-white/50">
              See all <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 px-5">
            {activeLoans.length === 0 ? (
              <p className="rounded-xl border border-dashed border-swin-charcoal/15 bg-white p-6 text-center text-[13px] text-swin-charcoal/50 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/50">
                No books borrowed yet.{' '}
                <Link href="/dashboard/book/items" className="text-swin-red underline">Browse catalogue</Link>
              </p>
            ) : (
              activeLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)
            )}
          </div>
        </BlurFade>

        {/* On reserve */}
        {holds.length > 0 && (
          <BlurFade delay={0.3} yOffset={10}>
            <div className="mb-3.5 mt-7 flex items-baseline justify-between px-5">
              <h2 className="font-display text-[22px] font-semibold tracking-tight">On reserve</h2>
              <span className="font-mono text-[11px] text-swin-charcoal/45 dark:text-white/45">
                {readyHolds.length > 0 && (
                  <span className="font-bold text-swin-red">{readyHolds.length} ready · </span>
                )}
                {holds.filter(h => h.status !== 'ready').length} queued
              </span>
            </div>
            <div className="flex flex-col gap-2.5 px-5">
              {sortedHolds.map(hold => <HoldCard key={hold.id} hold={hold} />)}
            </div>
          </BlurFade>
        )}

        {/* Picks from the stacks */}
        <BlurFade delay={0.35} yOffset={10}>
          <div className="mt-7 px-5 pb-3">
            <div className="mb-1 flex items-center gap-2">
              <SparklesIcon className="h-3.5 w-3.5 text-swin-gold" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-swin-gold">Curated for you</span>
            </div>
            <h2 className="font-display text-[22px] font-semibold tracking-tight">Picks from the stacks</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 pb-3 scrollbar-none">
            {SAMPLE_RECS.map(r => (
              <div key={r.id} className="w-[130px] flex-shrink-0">
                <BookCover gradient={getBookGradient(r.id)} title={r.title} author={r.author} w={130} h={184} radius={6} />
                <p className="mt-2.5 font-display text-[14px] font-semibold leading-tight tracking-tight">{r.title}</p>
                <p className="mt-0.5 font-display text-[11px] italic text-swin-charcoal/55 dark:text-white/55">{r.author}</p>
                <p className="mt-1.5 font-mono text-[10px] tracking-wide text-swin-charcoal/40 dark:text-white/40">{r.reason}</p>
              </div>
            ))}
          </div>
        </BlurFade>
      </div>

      {/* Mobile bottom nav is provided by MobileNav (in DashboardShell). */}

      {/* ========= DESKTOP LAYOUT (hidden on mobile) ========= */}
      <div className="hidden md:block">
        {/* Top bar */}
        <div className="mb-8 flex items-center gap-4 border-b border-swin-charcoal/10 pb-5 dark:border-white/10">
          <div className="flex flex-1 max-w-[520px] items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 dark:bg-swin-dark-surface">
            <BookOpenIcon className="h-4 w-4 text-swin-charcoal/35 dark:text-white/35" />
            <input
              readOnly
              placeholder="Search titles, authors, or ISBN… (⌘K)"
              className="flex-1 border-0 bg-transparent text-[14px] placeholder-swin-charcoal/35 outline-none dark:placeholder-white/35"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[12px] text-swin-charcoal/50 dark:text-white/50">
            <span>Sarawak Campus · Library B</span>
            <span className="mx-1.5 text-swin-charcoal/20 dark:text-white/20">·</span>
            <span className="text-green-600 dark:text-green-400">● Open until 10pm</span>
          </div>
        </div>

        {/* Hero + stats rail */}
        <div className="mb-8 grid grid-cols-[1.2fr_1fr] items-end gap-10">
          <div>
            <p className="mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[2.4px] text-swin-gold">
              · {new Date().toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-display text-[56px] font-[500] leading-none tracking-[-1.5px] text-swin-charcoal dark:text-white">
              Welcome back,
            </h1>
            <h1 className="mt-0.5 font-display text-[56px] font-[500] italic leading-none tracking-[-1.5px] text-swin-red">
              {firstName}.
            </h1>
            <p className="mt-4 max-w-[480px] font-display text-[18px] italic leading-relaxed text-swin-charcoal/55 dark:text-white/55">
              {overdueLoans.length > 0
                ? `You have ${overdueLoans.length} overdue ${overdueLoans.length === 1 ? 'loan' : 'loans'} — return or renew to avoid fines.`
                : urgentLoans.length > 0
                ? `${urgentLoans.length} ${urgentLoans.length === 1 ? 'book is' : 'books are'} due in the next few days.`
                : 'Your shelf is in good order. Keep reading.'}
            </p>
          </div>

          {/* Stats rail */}
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-swin-charcoal/10 bg-white dark:border-white/10 dark:bg-swin-dark-surface">
            {(() => {
              const ready = readyHolds.length;
              const queued = holds.filter(h => h.status !== 'ready').length;
              return [
                { label: 'Borrowed', value: activeLoans.length, accent: false },
                ready > 0
                  ? { label: 'Ready for pickup', value: ready, accent: true }
                  : { label: 'Due soon', value: urgentLoans.length, accent: urgentLoans.length > 0 },
                { label: 'In queue', value: queued, accent: false },
              ];
            })().map((s, i) => (
              <div key={s.label} className={`p-5 ${i < 2 ? 'border-r border-swin-charcoal/10 dark:border-white/10' : ''}`}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-swin-charcoal/40 dark:text-white/40">
                  {s.label}
                </p>
                <p className={`font-display text-[42px] font-semibold leading-none tracking-[-1px] ${s.accent ? 'text-swin-red' : 'text-swin-charcoal dark:text-white'}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action rail */}
        <div className="mb-9 grid grid-cols-[2fr_1fr_1fr] gap-3.5">
          <ScanCtaButton
            href="/dashboard/book/checkout"
            variant="red"
            size="lg"
            eyebrow="Self-Checkout"
            title="Scan a book to borrow"
            icon={QrCodeIcon}
          />

          {[
            { icon: BookmarkIcon, label: 'Place a reservation', sub: 'Queue up a book', href: '/dashboard/book/items' },
            { icon: SparklesIcon, label: 'Popular this week', sub: 'Trending on campus', href: '/dashboard/recommendations' },
          ].map(q => (
            <Link
              key={q.label}
              href={q.href}
              className="flex items-center gap-3.5 rounded-2xl border border-swin-charcoal/10 bg-white p-5 transition hover:border-swin-charcoal/20 dark:border-white/10 dark:bg-swin-dark-surface dark:hover:border-white/20"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-swin-gold/12 text-swin-gold dark:bg-swin-gold/15 dark:text-yellow-300">
                <q.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-display text-[17px] font-semibold leading-tight tracking-tight">{q.label}</p>
                <p className="mt-0.5 text-[12px] text-swin-charcoal/45 dark:text-white/45">{q.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Two-column: loans + holds/rec */}
        <div className="grid grid-cols-[1.6fr_1fr] gap-7">
          {/* Left: currently reading */}
          <div>
            <div className="mb-3.5 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-[28px] font-semibold leading-none tracking-tight text-swin-charcoal dark:text-white">
                  Currently reading
                </h2>
                <p className="mt-1 font-mono text-[12px] text-swin-charcoal/40 dark:text-white/40">
                  {activeLoans.length} active · {activeLoans.reduce((a, l) => a + l.renewedCount, 0)} renewals this term
                </p>
              </div>
              <Link href="/dashboard/my-books" className="flex items-center gap-1 text-[12px] text-swin-charcoal/50 dark:text-white/50">
                View history <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {activeLoans.length === 0 ? (
                <p className="rounded-xl border border-dashed border-swin-charcoal/15 bg-white p-8 text-center text-[13px] text-swin-charcoal/50 dark:border-white/10 dark:bg-swin-dark-surface dark:text-white/50">
                  No books borrowed.{' '}
                  <Link href="/dashboard/book/items" className="text-swin-red underline">Browse catalogue →</Link>
                </p>
              ) : (
                activeLoans.map(loan => <LoanCard key={loan.id} loan={loan} />)
              )}
            </div>
          </div>

          {/* Right: holds + curated pick */}
          <div>
            <div className="mb-3.5">
              <h2 className="font-display text-[22px] font-semibold leading-none tracking-tight">On reserve</h2>
              <p className="mt-1 font-mono text-[11px] text-swin-charcoal/40 dark:text-white/40">
                {readyHolds.length > 0 && (
                  <span className="font-bold text-swin-red">{readyHolds.length} ready · </span>
                )}
                {holds.filter(h => h.status !== 'ready').length} in queue
              </p>
            </div>

            {holds.length > 0 && (
              <div className="mb-7 flex flex-col gap-2.5">
                {sortedHolds.map(hold => <HoldCard key={hold.id} hold={hold} />)}
              </div>
            )}

            {/* Curated pick */}
            <div className="rounded-[14px] border border-swin-charcoal/10 bg-white p-5 dark:border-white/10 dark:bg-swin-dark-surface">
              <div className="mb-2.5 flex items-center gap-1.5">
                <SparklesIcon className="h-3 w-3 text-swin-gold" />
                <span className="font-mono text-[9px] font-bold uppercase tracking-[2px] text-swin-gold">Curated pick</span>
              </div>
              <div className="flex gap-3.5">
                <BookCover gradient={getBookGradient(SAMPLE_RECS[0].id)} title={SAMPLE_RECS[0].title} author={SAMPLE_RECS[0].author} w={72} h={104} radius={4} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[18px] font-semibold leading-tight tracking-tight text-swin-charcoal dark:text-white">
                    {SAMPLE_RECS[0].title}
                  </p>
                  <p className="mt-0.5 font-display text-[12px] italic text-swin-charcoal/55 dark:text-white/55">
                    by {SAMPLE_RECS[0].author}
                  </p>
                  <p className="mt-2 font-mono text-[10px] tracking-wide text-swin-charcoal/40 dark:text-white/40">
                    {SAMPLE_RECS[0].reason}
                  </p>
                  <Link
                    href="/dashboard/book/items"
                    className="mt-2.5 inline-flex rounded-lg bg-swin-red px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-swin-red/90"
                  >
                    Place hold
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
