'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { FaqAssistantResponse, FaqKind } from '@/app/api/faq-assistant/route';

type StepMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  kind?: FaqKind;
  steps?: string[];
};

type QuickPrompt = {
  id: string;
  label: string;
  message: string;
};

const QUICK_PROMPTS: QuickPrompt[] = [
  { id: 'borrow', label: 'How do I borrow a book?', message: 'How do I borrow a book?' },
  { id: 'return', label: 'How do I return a book?', message: 'How do I return a book?' },
  { id: 'scanner', label: 'How to use the barcode scanner?', message: 'How do I use the barcode scanner?' },
  { id: 'due', label: 'How long can I keep a book?', message: 'How long can I keep a borrowed book and can I renew it?' },
  { id: 'overdue', label: 'What happens if I return late?', message: 'What happens if I return a book late?' },
  { id: 'login', label: 'I cannot log in', message: 'I cannot log in to the dashboard, what should I do?' },
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const buildWelcome = (): StepMessage => ({
  id: 'welcome',
  sender: 'assistant',
  kind: 'greeting',
  text: 'Hi! I am your Library Assistant. Ask me anything about borrowing, returning, due dates, or using the scanner — and I will guide you step by step.',
  steps: [],
});

export default function FaqAiAssistant() {
  const [messages, setMessages] = useState<StepMessage[]>([buildWelcome()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: StepMessage = { id: createId(), sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/faq-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const fallback = res.status === 429
          ? 'You are sending messages too quickly. Please wait a moment and try again.'
          : 'Something went wrong. Please try again.';
        setMessages((prev) => [
          ...prev,
          { id: createId(), sender: 'assistant', kind: 'error', text: fallback, steps: [] },
        ]);
        return;
      }

      const data = (await res.json()) as FaqAssistantResponse;
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          kind: data.kind,
          text: data.reply,
          steps: data.steps ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          kind: 'error',
          text: 'Could not reach the assistant. Please check your connection and try again.',
          steps: [],
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    setUsedPrompts((prev) => new Set([...prev, prompt.id]));
    sendMessage(prompt.message);
  };

  const remainingPrompts = QUICK_PROMPTS.filter((p) => !usedPrompts.has(p.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Chat window */}
      <div className="flex flex-col rounded-3xl border border-swin-charcoal/10 bg-white shadow-lg shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">

        {/* Messages */}
        <div className="flex flex-col gap-5 overflow-y-auto p-5 md:p-6" style={{ minHeight: '360px', maxHeight: '520px' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                'flex flex-col gap-1',
                msg.sender === 'user' ? 'items-end' : 'items-start',
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/40 dark:text-slate-500">
                {msg.sender === 'user' ? 'You' : 'Library Assistant'}
              </span>

              {msg.sender === 'user' ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-swin-red px-4 py-2.5 text-sm text-white shadow-sm shadow-swin-red/30">
                  {msg.text}
                </div>
              ) : (
                <div className="flex w-full max-w-[90%] flex-col gap-3">
                  {/* Reply text */}
                  {msg.text && (
                    <div className="rounded-2xl rounded-bl-md border border-swin-charcoal/10 bg-swin-ivory px-4 py-3 text-sm text-swin-charcoal shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                      {msg.text}
                    </div>
                  )}

                  {/* Tutorial steps */}
                  {msg.kind === 'tutorial' && msg.steps && msg.steps.length > 0 && (
                    <ol className="flex flex-col gap-2.5">
                      {msg.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-swin-red text-xs font-bold text-white shadow-sm shadow-swin-red/30">
                            {index + 1}
                          </span>
                          <div className="rounded-2xl border border-swin-charcoal/10 bg-white px-4 py-2.5 text-sm text-swin-charcoal shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                            {step}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Quick-action buttons embedded in tutorial replies */}
                  {msg.kind === 'tutorial' && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      <Link
                        href="/dashboard/book/checkout"
                        className="inline-flex items-center gap-1 rounded-full border border-swin-red/30 bg-white px-3 py-1 text-xs font-semibold text-swin-red shadow-sm transition hover:bg-swin-red hover:text-white dark:border-swin-red/40 dark:bg-slate-800 dark:text-swin-red dark:hover:bg-swin-red dark:hover:text-white"
                      >
                        Open Borrow Books →
                      </Link>
                      <Link
                        href="/dashboard/cameraScan"
                        className="inline-flex items-center gap-1 rounded-full border border-swin-charcoal/15 bg-white px-3 py-1 text-xs font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red/40 hover:text-swin-red dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-swin-red"
                      >
                        Camera Scan →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex flex-col items-start gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/40 dark:text-slate-500">
                Library Assistant
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-swin-charcoal/10 bg-swin-ivory px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <span className="h-2 w-2 animate-bounce rounded-full bg-swin-charcoal/40 dark:bg-slate-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-swin-charcoal/40 dark:bg-slate-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-swin-charcoal/40 dark:bg-slate-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {remainingPrompts.length > 0 && (
          <div className="border-t border-swin-charcoal/10 px-5 py-3 dark:border-slate-700">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/50 dark:text-slate-500">
              Quick questions
            </p>
            <div className="flex flex-wrap gap-2">
              {remainingPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-swin-charcoal/15 bg-swin-ivory px-3 py-1.5 text-xs font-semibold text-swin-charcoal shadow-sm transition hover:border-swin-red/50 hover:bg-swin-red hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-swin-red/50 dark:hover:bg-swin-red dark:hover:text-white"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-swin-charcoal/10 p-4 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me how to borrow, return, or use the system…"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-2xl border border-swin-charcoal/15 bg-swin-ivory px-4 py-2.5 text-sm text-swin-charcoal placeholder:text-swin-charcoal/40 focus:border-swin-red/50 focus:outline-none focus:ring-2 focus:ring-swin-red/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-swin-red/50"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-swin-red text-white shadow-sm shadow-swin-red/30 transition hover:bg-swin-red/90 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.849-8.44.75.75 0 0 0 0-1.056A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-[10px] text-swin-charcoal/40 dark:text-slate-600">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Still need help */}
      <div className="rounded-2xl border border-swin-charcoal/10 bg-swin-ivory/70 p-5 shadow-inner shadow-swin-charcoal/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
        <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-semibold text-swin-charcoal dark:text-slate-100">Still need help from a person?</p>
            <p className="mt-1 text-swin-charcoal/70 dark:text-slate-300">
              Visit the service desk on Level 1 or email{' '}
              <a href="mailto:library@swinburne.edu.my" className="font-semibold text-swin-red hover:underline">
                library@swinburne.edu.my
              </a>{' '}
              with your student ID.
            </p>
          </div>
          <Link
            href="/dashboard/chat"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-swin-red/40 bg-white px-4 py-2 text-sm font-semibold text-swin-red shadow-sm transition hover:bg-swin-red hover:text-white dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-swin-red dark:hover:text-white"
          >
            Chat with staff
          </Link>
        </div>
      </div>
    </div>
  );
}
