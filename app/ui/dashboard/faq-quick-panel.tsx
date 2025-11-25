'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  QuestionMarkCircleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  SparklesIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { studentFaqSections } from '@/app/ui/dashboard/student-faq-data';
import type { DashboardRole } from '@/app/lib/auth/types';
import { useTheme } from '@/app/ui/theme/theme-provider';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    { id: 'learning-path', label: 'Learn', icon: AcademicCapIcon, href: '/dashboard/learning-paths' },
    { id: 'learning-hub', label: 'Hub', icon: BookOpenIcon, href: '/dashboard/learning' },
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

              const labelClasses = clsx(
                'inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-semibold shadow-lg backdrop-blur-sm',
                isDark ? 'bg-white/10 text-slate-100' : 'bg-slate-900/80 text-white',
              );

              const iconButtonClasses = clsx(
                'grid h-11 w-11 place-items-center rounded-full shadow-xl ring-1 transition hover:-translate-y-0.5 hover:shadow-2xl',
                isDark ? 'bg-slate-900 text-swin-red ring-swin-red/25' : 'bg-white text-swin-red ring-swin-red/15',
              );

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
            className={clsx(
              'grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red/50',
              'bg-gradient-to-tr from-swin-red to-swin-red/90 hover:from-swin-red/90 hover:to-swin-red/80',
              isDark ? 'shadow-swin-red/60' : 'shadow-swin-red/40',
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
          'fixed bottom-[180px] right-4 z-40 w-[min(80vw,280px)] rounded-3xl p-2 transition-all duration-200 ease-out md:bottom-20 md:right-12',
          'overflow-auto md:min-w-[320px] md:min-h-[360px] md:w-[360px] md:max-w-[90vw] md:max-h-[80vh] md:resize',
          isDark
            ? 'border border-swin-red/60 bg-slate-900 text-slate-100 shadow-2xl shadow-black/40'
            : 'border border-swin-red/50 bg-white text-swin-charcoal shadow-2xl shadow-swin-red/20',
          isPanelOpen
            ? 'pointer-events-auto opacity-100 translate-y-0 scale-100'
            : 'pointer-events-none opacity-0 translate-y-4 scale-95',
        )}
        onClick={handlePanelClick}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className={clsx(
                'text-xs font-semibold uppercase tracking-[0.35em]',
                isDark ? 'text-slate-200/70' : 'text-swin-charcoal/60',
              )}
            >
              Need help?
            </p>
            <h2 className={clsx('text-lg font-semibold', isDark ? 'text-slate-100' : 'text-swin-charcoal')}>
              Student FAQ
            </h2>
            <p className={clsx('text-sm', isDark ? 'text-slate-200/80' : 'text-swin-charcoal/70')}>
              Quick answers for borrowing and returns.
            </p>
          </div>
          <button
            type="button"
            onClick={togglePanel}
            className={clsx(
              'rounded-full border p-1 transition',
              isDark
                ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'border-swin-charcoal/10 text-swin-charcoal/70 hover:bg-swin-ivory',
            )}
            aria-label="Close FAQ panel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          </div>

          <div
            className={clsx(
              'mt-2 flex h-44 flex-col rounded-2xl p-3 text-sm shadow-inner md:h-60',
              isDark
                ? 'border border-slate-700 bg-slate-900/60 text-slate-100 shadow-black/20'
                : 'border border-swin-charcoal/10 bg-swin-ivory/50 text-swin-charcoal shadow-swin-charcoal/5',
            )}
          >
            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={clsx(
                    'flex flex-col gap-1',
                    message.sender === 'student' ? 'items-end' : 'items-start',
                  )}
                >
                  <span
                    className={clsx(
                      'text-[10px] font-semibold uppercase tracking-wide',
                      isDark ? 'text-slate-200/60' : 'text-swin-charcoal/50',
                    )}
                  >
                    {message.sender === 'student' ? 'You' : 'Library Assistant'}
                  </span>
                  <div
                    className={clsx(
                      'rounded-2xl px-3 py-2 shadow-sm',
                      message.sender === 'student'
                        ? 'rounded-br-md bg-swin-red text-white shadow-swin-red/30'
                        : isDark
                          ? 'rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100 shadow-black/20'
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
            <p
              className={clsx(
                'text-[11px] font-semibold uppercase tracking-wide',
                isDark ? 'text-slate-200/70' : 'text-swin-charcoal/60',
              )}
            >
              Quick questions
            </p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
              {quickFaqs.map((faq) => (
                <button
                  key={faq.id}
                  type="button"
                  onClick={() => handleQuickFaqSelect(faq)}
                  className={clsx(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition',
                    isDark
                      ? 'border border-slate-700 bg-slate-900 text-white hover:border-swin-red/50 hover:text-swin-red'
                      : 'border border-swin-charcoal/15 bg-white text-swin-charcoal hover:border-swin-red/50 hover:text-swin-red',
                  )}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className={clsx('text-xs', isDark ? 'text-slate-200/80' : 'text-swin-charcoal/70')}>
              Want more answers?
            </p>
            <Link
              href="/dashboard/faq"
              className={clsx(
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
                isDark
                  ? 'border border-swin-red/40 text-swin-red hover:bg-swin-red hover:text-white'
                  : 'border border-swin-red/30 text-swin-red hover:bg-swin-red hover:text-white',
              )}
            >
              Open full FAQ
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Link>
          </div>
      </div>
    </>
  );
}
