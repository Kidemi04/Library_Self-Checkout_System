'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  SparklesIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { studentFaqSections } from '@/app/ui/dashboard/studentFaqData';
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
    { id: 'learning-hub', label: 'Learn', icon: BookOpenIcon, href: '/dashboard/learning' },
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

              const labelClasses =
                'inline-flex h-8 items-center justify-center rounded-pill bg-ink px-3 font-sans text-caption-uppercase text-on-dark shadow-md backdrop-blur-sm dark:bg-on-dark/15 dark:text-on-dark';

              const iconButtonClasses =
                'grid h-11 w-11 place-items-center rounded-full bg-surface-card text-primary ring-1 ring-primary/20 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-dark-surface-card dark:text-dark-primary dark:ring-dark-primary/30';

              if (action.href) {
                return (
                  <div key={action.id} className="flex items-center gap-3">
                    <span className={labelClasses}>{action.label}</span>
                    <Link
                      href={action.href}
                      className={iconButtonClasses}
                      onClick={() => setIsFabOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </div>
                );
              }

              return (
                <div key={action.id} className="flex items-center gap-3">
                  <span className={labelClasses}>{action.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      action.onClick?.();
                      setIsFabOpen(false);
                    }}
                    className={iconButtonClasses}
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
            className="grid h-14 w-14 place-items-center rounded-full bg-primary text-on-primary shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-primary/90"
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
        className="fixed right-12 bottom-10 z-40 hidden items-center justify-center gap-2 rounded-pill bg-primary px-6 py-3 font-sans text-button text-on-primary shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-primary/90 md:flex"
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
          'fixed bottom-[180px] right-4 z-40 w-[min(80vw,280px)] rounded-card border border-primary/30 bg-surface-card p-2 text-ink shadow-[0_4px_16px_rgba(20,20,19,0.08)] transition-all duration-200 ease-out md:bottom-20 md:right-12 md:min-w-[320px] md:min-h-[360px] md:w-[360px] md:max-w-[90vw] md:max-h-[80vh] md:resize',
          'overflow-auto dark:border-primary/40 dark:bg-dark-surface-card dark:text-on-dark',
          isPanelOpen
            ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
            : 'pointer-events-none opacity-0 translate-y-4 scale-95',
        )}
        onClick={handlePanelClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-sans text-caption-uppercase tracking-[0.35em] text-muted dark:text-on-dark-soft">
              Need help?
            </p>
            <h2 className="font-display text-display-sm text-ink dark:text-on-dark">
              Student FAQ
            </h2>
            <p className="font-sans text-body-sm text-body dark:text-on-dark/80">
              Quick answers for borrowing and returns.
            </p>
          </div>
          <button
            type="button"
            onClick={togglePanel}
            className="rounded-full border border-hairline p-1 text-muted transition hover:bg-surface-cream-strong hover:text-ink dark:border-dark-hairline dark:text-on-dark-soft dark:hover:bg-dark-surface-strong dark:hover:text-on-dark"
            aria-label="Close FAQ panel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 flex h-44 flex-col rounded-card border border-hairline bg-surface-cream-strong/50 p-3 font-sans text-body-sm text-ink shadow-inner md:h-60 dark:border-dark-hairline dark:bg-dark-surface-strong/60 dark:text-on-dark">
          <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  'flex flex-col gap-1',
                  message.sender === 'student' ? 'items-end' : 'items-start',
                )}
              >
                <span className="font-sans text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-on-dark-soft">
                  {message.sender === 'student' ? 'You' : 'Library Assistant'}
                </span>
                <div
                  className={clsx(
                    'rounded-card px-3 py-2',
                    message.sender === 'student'
                      ? 'rounded-br-md bg-primary text-on-primary'
                      : 'rounded-bl-md border border-hairline bg-surface-card dark:border-dark-hairline dark:bg-dark-surface-card',
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <p className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
            Quick questions
          </p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
            {quickFaqs.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => handleQuickFaqSelect(faq)}
                className="shrink-0 rounded-pill border border-hairline bg-surface-card px-3 py-1 font-sans text-caption text-ink transition hover:border-primary/40 hover:text-primary dark:border-dark-hairline dark:bg-dark-surface-card dark:text-on-dark dark:hover:text-dark-primary"
              >
                {faq.question}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-caption text-muted dark:text-on-dark-soft">
            Want more answers?
          </p>
          <Link
            href="/dashboard/faq"
            className="inline-flex items-center gap-1 rounded-pill border border-primary/40 px-3 py-1 font-sans text-caption font-semibold text-primary transition hover:bg-primary hover:text-on-primary"
          >
            Open full FAQ
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
