'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { studentFaqSections } from '@/app/ui/dashboard/student-faq-data';
import type { DashboardRole } from '@/app/lib/auth/types';

type ChatMessage = {
  id: string;
  sender: 'student' | 'assistant';
  text: string;
};

type QuickFaq = {
  id: string;
  question: string;
  answer: string;
  section: string;
};

type QuickAction = {
  id: string;
  label: string;
  icon: typeof QuestionMarkCircleIcon;
  href?: string;
  onClick?: () => void;
};

type FaqQuickPanelProps = {
  role: DashboardRole;
};

const buildInitialMessages = (): ChatMessage[] => [
  {
    id: 'assistant-welcome',
    sender: 'assistant',
    text: 'Hi! Tap any question below and I will send the answer right here.',
  },
];

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function FaqQuickPanel({ role }: FaqQuickPanelProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => buildInitialMessages());
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const quickFaqs = useMemo<QuickFaq[]>(() => {
    return studentFaqSections
      .flatMap((section) =>
        section.items.slice(0, 2).map((item, index) => ({
          id: `${section.id}-${index}`,
          question: item.question,
          answer: item.answer.join(' '),
          section: section.title,
        })),
      )
      .slice(0, 6);
  }, []);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isPanelOpen]);

  if (role !== 'user') {
    return null;
  }

  const openPanel = () => {
    setIsPanelOpen(true);
    setIsFabOpen(false);
    setMessages(buildInitialMessages());
  };

  const togglePanel = () => {
    setIsPanelOpen((prev) => {
      const next = !prev;
      if (next) {
        setMessages(buildInitialMessages());
      }
      return next;
    });
    setIsFabOpen(false);
  };

  const toggleFab = () => {
    setIsFabOpen((prev) => {
      const next = !prev;
      if (!next) {
        setIsPanelOpen(false);
      }
      return next;
    });
  };

  const handlePanelClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleQuickFaqSelect = (faq: QuickFaq) => {
    setMessages((prev) => [
      ...prev,
      { id: createMessageId(), sender: 'student', text: faq.question },
      { id: createMessageId(), sender: 'assistant', text: faq.answer },
    ]);
  };

  const quickActions: QuickAction[] = [
    { id: 'ai-recs', label: 'AI', icon: SparklesIcon, href: '/dashboard/recommendations' },
    { id: 'faq', label: 'FAQ', icon: QuestionMarkCircleIcon, onClick: openPanel },
  ];

  return (
    <>
      <div className="fixed right-4 bottom-[150px] z-40 md:hidden">
        <div className="relative flex flex-col items-end">
          <div
            className={clsx(
              'absolute bottom-16 right-0 flex flex-col items-end gap-3 transition-all duration-200 ease-out',
              isFabOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none',
            )}
          >
            {quickActions.map((action) => {
              const Icon = action.icon;

              if (action.href) {
                return (
                  <div key={action.id} className="flex items-center gap-3">
                    <span className="inline-flex h-8 items-center justify-center rounded-full bg-slate-900/80 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                      {action.label}
                    </span>
                    <Link
                      href={action.href}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-swin-red shadow-xl ring-1 ring-swin-red/15 transition hover:-translate-y-0.5 hover:shadow-2xl"
                      onClick={() => setIsFabOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </div>
                );
              }

              return (
                <div key={action.id} className="flex items-center gap-3">
                  <span className="inline-flex h-8 items-center justify-center rounded-full bg-slate-900/80 px-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm">
                    {action.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      action.onClick?.();
                      setIsFabOpen(false);
                    }}
                    className="grid h-11 w-11 place-items-center rounded-full bg-white text-swin-red shadow-xl ring-1 ring-swin-red/15 transition hover:-translate-y-0.5 hover:shadow-2xl"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={toggleFab}
            className={clsx(
              'grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/50',
              'bg-gradient-to-tr from-swin-red to-swin-red/90 hover:from-swin-red/90 hover:to-swin-red/80 shadow-swin-red/40',
            )}
            aria-expanded={isFabOpen}
            aria-label="Open quick actions"
          >
            <PlusIcon
              className={clsx(
                'h-6 w-6 transition-transform duration-200',
                isFabOpen ? 'rotate-45' : 'rotate-0',
              )}
            />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePanel}
        className={clsx(
          'fixed right-12 bottom-10 z-40 hidden items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red md:flex',
          'bg-swin-red hover:bg-swin-red/90 shadow-swin-red/40',
          'gap-2 px-6 py-3 text-sm',
        )}
        aria-expanded={isPanelOpen}
        aria-controls="faq-quick-panel"
        aria-label="Open Student FAQ panel"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
        <span>FAQ</span>
      </button>

      <div
        role={isPanelOpen ? 'dialog' : undefined}
        aria-modal={isPanelOpen ? 'true' : undefined}
        aria-hidden={!isPanelOpen}
        id="faq-quick-panel"
        className={clsx(
          'fixed bottom-[180px] right-4 z-40 w-[min(84vw,300px)] rounded-3xl border border-swin-red/50 bg-white p-2.5 shadow-2xl shadow-swin-red/20 transition-all duration-200 ease-out md:bottom-20 md:right-12',
          isPanelOpen
            ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
            : 'pointer-events-none opacity-0 translate-y-4 scale-95',
        )}
        onClick={handlePanelClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-swin-charcoal/60">
              Need help?
            </p>
              <h2 className="text-lg font-semibold text-swin-charcoal">Student FAQ</h2>
              <p className="text-sm text-swin-charcoal/70">
                Quick answers for borrowing and returns.
              </p>
            </div>
            <button
              type="button"
              onClick={togglePanel}
              className="rounded-full border border-swin-charcoal/10 p-1 text-swin-charcoal/70 transition hover:bg-swin-ivory"
              aria-label="Close FAQ panel"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-2 flex h-48 flex-col rounded-2xl border border-swin-charcoal/10 bg-swin-ivory/50 p-3 text-sm text-swin-charcoal shadow-inner shadow-swin-charcoal/5 md:h-60">
            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'flex flex-col gap-1',
                    message.sender === 'student' ? 'items-end' : 'items-start',
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-swin-charcoal/50">
                    {message.sender === 'student' ? 'You' : 'Library Assistant'}
                  </span>
                  <div
                    className={clsx(
                      'rounded-2xl px-3 py-2 shadow-sm',
                      message.sender === 'student'
                        ? 'rounded-br-md bg-swin-red text-white shadow-swin-red/30'
                        : 'rounded-bl-md border border-swin-charcoal/10 bg-white shadow-swin-charcoal/10',
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-swin-charcoal/60">
              Quick questions
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {quickFaqs.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleQuickFaqSelect(faq)}
                  className="shrink-0 rounded-full border border-swin-charcoal/15 bg-white px-3 py-1 text-xs font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red/50 hover:text-swin-red"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-xs text-swin-charcoal/70">
              Want more answers?
            </p>
            <Link
              href="/dashboard/faq"
              className="inline-flex items-center gap-1 rounded-full border border-swin-red/30 px-3 py-1 text-xs font-semibold text-swin-red transition hover:bg-swin-red hover:text-white"
            >
              Open full FAQ
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          </div>
      </div>
    </>
  );
}
