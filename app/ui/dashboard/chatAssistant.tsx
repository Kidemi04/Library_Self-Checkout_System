'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  text: string;
  time: string;
};

const QUICK_REPLIES = [
  'What are my current loans?',
  'How do I renew a book?',
  'Is "Sapiens" available?',
  "What's my overdue fine?",
];

const SUPPORT_HOURS: Array<{ label: string; value: string }> = [
  { label: 'Weekdays', value: '8:00 AM – 9:00 PM' },
  { label: 'After hours', value: 'Auto-reply + email' },
  { label: 'Hotline', value: '+6082 260936' },
];

const QUICK_LINKS: Array<{ href: string; label: string; sub: string }> = [
  { href: '/dashboard/faq', label: 'Borrowing FAQ', sub: 'Limits, renewals, returns' },
  { href: '/dashboard', label: 'My active loans', sub: 'Current dashboard' },
  { href: '/dashboard/notifications', label: 'Notifications', sub: 'Due reminders & holds' },
];

function nowLabel(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function cannedReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('loan') || p.includes('borrow')) {
    return "You can see every active loan on your dashboard. Each card shows the title, the due date, and a 'Renew' button when renewal is allowed.";
  }
  if (p.includes('renew')) {
    return 'To renew, open My Books → Current and tap "Renew" next to the title. You can renew up to 2 times per item, unless someone has placed a hold.';
  }
  if (p.includes('overdue') || p.includes('fine')) {
    return 'Overdue fines are RM 0.50 per day, per item. Your current balance shows on your profile — settle it at the desk to keep borrowing.';
  }
  if (p.includes('available') || p.includes('sapiens')) {
    return 'Search the catalogue for the title — the result card shows live availability per copy. If everything is on loan, you can place a hold.';
  }
  return 'I can help with loans, holds, renewals, fines, and finding books. Could you tell me a little more about what you need?';
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'greeting',
      role: 'assistant',
      text: "Hi! I'm the library assistant. Ask me about loans, holds, renewals, or finding a book.",
      time: nowLabel(),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const feedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = feedRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  function send(text?: string) {
    const value = (text ?? draft).trim();
    if (!value || typing) return;
    const userMsg: Message = { id: makeId(), role: 'user', text: value, time: nowLabel() };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'assistant', text: cannedReply(value), time: nowLabel() },
      ]);
      setTyping(false);
    }, 1200);
  }

  return (
    <div className="grid h-[640px] gap-6 md:grid-cols-[minmax(0,1fr)_280px] lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Left: feed + chips + input */}
      <div className="flex min-h-0 flex-col">
        <div
          ref={feedRef}
          className="flex flex-1 flex-col gap-3.5 overflow-y-auto pb-4 pt-6"
          aria-live="polite"
        >
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
          {typing ? <TypingRow /> : null}
        </div>

        <div className="flex flex-wrap gap-1.5 pb-3">
          {QUICK_REPLIES.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => send(chip)}
              className="rounded-pill border border-hairline bg-surface-card px-3 py-1.5 font-sans text-[11px] font-medium text-body transition hover:border-primary/30 hover:bg-surface-cream-strong hover:text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark-soft dark:hover:text-on-dark"
            >
              {chip}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 pb-7"
        >
          <div className="flex flex-1 items-center rounded-card border border-hairline bg-surface-card px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 dark:border-dark-hairline dark:bg-dark-surface-card">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask me anything about the library…"
              className="w-full border-0 bg-transparent p-0 font-sans text-[13px] text-ink placeholder:text-muted-soft focus:outline-none focus:ring-0 dark:text-on-dark dark:placeholder:text-on-dark-soft"
              aria-label="Type your message"
            />
          </div>
          <button
            type="submit"
            aria-label="Send message"
            disabled={!draft.trim() || typing}
            className="flex h-11 w-11 items-center justify-center rounded-card bg-primary text-on-primary transition hover:bg-primary-active disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted dark:bg-dark-primary dark:hover:bg-primary-active"
          >
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>

      {/* Right: sidebar */}
      <aside className="hidden flex-col gap-3.5 self-start pb-7 pt-6 md:flex">
        <div className="rounded-hero border border-hairline bg-surface-card p-5 dark:border-dark-hairline dark:bg-dark-surface-card">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted dark:text-on-dark-soft">
            Support hours
          </p>
          <dl className="mt-3 space-y-2.5">
            {SUPPORT_HOURS.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <dt className="font-mono text-[10px] uppercase tracking-wide text-muted-soft dark:text-on-dark-soft">
                  {row.label}
                </dt>
                <dd className="font-sans text-[13px] font-semibold text-ink dark:text-on-dark">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-hero border border-hairline bg-surface-card p-5 dark:border-dark-hairline dark:bg-dark-surface-card">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted dark:text-on-dark-soft">
            Quick links
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-btn border border-hairline bg-canvas px-3 py-2.5 transition hover:border-primary/30 hover:bg-surface-cream-strong dark:border-dark-hairline dark:bg-dark-surface-soft dark:hover:bg-dark-surface-strong"
              >
                <p className="font-sans text-[12px] font-semibold text-ink dark:text-on-dark">
                  {link.label}
                </p>
                <p className="font-sans text-[10px] text-muted dark:text-on-dark-soft">
                  {link.sub}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser ? (
        <div
          aria-hidden="true"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary font-display text-[12px] font-semibold text-on-primary dark:bg-dark-primary"
        >
          L
        </div>
      ) : null}
      <div className={`flex max-w-[72%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={
            isUser
              ? 'rounded-[16px_16px_4px_16px] bg-primary px-4 py-3 font-sans text-[13px] leading-[1.55] text-on-primary dark:bg-dark-primary'
              : 'rounded-[16px_16px_16px_4px] border border-hairline bg-surface-card px-4 py-3 font-sans text-[13px] leading-[1.55] text-ink dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark'
          }
          style={{ whiteSpace: 'pre-line' }}
        >
          {message.text}
        </div>
        <p
          className={`mt-1 font-mono text-[10px] text-muted-soft dark:text-on-dark-soft ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div className="flex items-end gap-2.5">
      <div
        aria-hidden="true"
        className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary font-display text-[12px] font-semibold text-on-primary dark:bg-dark-primary"
      >
        L
      </div>
      <div className="flex items-center gap-1 rounded-[16px_16px_16px_4px] border border-hairline bg-surface-card px-4 py-3 dark:border-dark-hairline dark:bg-dark-surface-card">
        <span className="h-1.5 w-1.5 animate-pulse rounded-[3px] bg-muted [animation-delay:-200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-[3px] bg-muted [animation-delay:-100ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-[3px] bg-muted" />
      </div>
    </div>
  );
}
