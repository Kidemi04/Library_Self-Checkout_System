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

type QuickPrompt = { id: string; label: string; message: string };

const QUICK_PROMPTS: QuickPrompt[] = [
  { id: 'borrow',  label: 'Borrow a book',      message: 'How do I borrow a book?' },
  { id: 'return',  label: 'Return a book',       message: 'How do I return a book?' },
  { id: 'renew',   label: 'Renew my loan',       message: 'How do I renew my loan?' },
  { id: 'scanner', label: 'Barcode scanner',     message: 'How do I use the barcode scanner?' },
  { id: 'fines',   label: 'Fines & overdue',     message: 'What are the fines for returning a book late?' },
  { id: 'lost',    label: 'Lost a book',         message: 'What do I do if I lost or damaged a library book?' },
  { id: 'pay',     label: 'Pay fines',           message: 'How do I pay library fines?' },
  { id: 'limits',  label: 'Loan limits',         message: 'What are the loan periods and borrowing limits for students?' },
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const welcome = (): StepMessage => ({
  id: 'welcome',
  sender: 'assistant',
  kind: 'greeting',
  text: 'Hi! Ask me anything about borrowing, returning, fines, or using the library system.',
  steps: [],
});

export default function FaqAiAssistant() {
  const [messages, setMessages]     = useState<StepMessage[]>([welcome()]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef  = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: createId(), sender: 'user', text: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const res  = await fetch('/api/faq-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = (await res.json()) as FaqAssistantResponse;
      const fallback = res.status === 429
        ? 'Too many messages — please wait a moment.'
        : !res.ok ? 'Something went wrong. Please try again.' : null;

      setMessages((prev) => [
        ...prev,
        fallback
          ? { id: createId(), sender: 'assistant', kind: 'error', text: fallback, steps: [] }
          : { id: createId(), sender: 'assistant', kind: data.kind, text: data.reply, steps: data.steps ?? [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: createId(), sender: 'assistant', kind: 'error', text: 'Connection error. Please try again.', steps: [] },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); send(input); };
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };
  const handleQuickPrompt = (p: QuickPrompt) => {
    setUsedPrompts((prev) => new Set([...prev, p.id]));
    send(p.message);
  };

  const remaining = QUICK_PROMPTS.filter((p) => !usedPrompts.has(p.id));

  return (
    <div className="flex flex-col rounded-3xl border border-swin-charcoal/10 bg-white shadow-lg shadow-swin-charcoal/5 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">

      {/* Header */}
      <div className="relative overflow-hidden rounded-t-3xl px-5 py-4 md:px-6">
        <div className="absolute inset-0 bg-gradient-to-r from-swin-charcoal via-swin-red to-[#3b0b14]" />
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">Library Assistant</p>
          <p className="mt-0.5 text-base font-semibold text-white">How can I help you?</p>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex flex-col gap-4 overflow-y-auto px-5 py-4 md:px-6"
        style={{ minHeight: '300px', maxHeight: '480px' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx('flex flex-col gap-1', msg.sender === 'user' ? 'items-end' : 'items-start')}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/40 dark:text-slate-500">
              {msg.sender === 'user' ? 'You' : 'Assistant'}
            </span>

            {msg.sender === 'user' ? (
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-swin-red px-4 py-2.5 text-sm text-white shadow-sm">
                {msg.text}
              </div>
            ) : (
              <div className="flex w-full max-w-[92%] flex-col gap-2.5">
                {msg.text && (
                  <div className="rounded-2xl rounded-bl-md border border-swin-charcoal/10 bg-swin-ivory px-4 py-2.5 text-sm text-swin-charcoal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    {msg.text}
                  </div>
                )}
                {msg.kind === 'tutorial' && msg.steps && msg.steps.length > 0 && (
                  <ol className="flex flex-col gap-2">
                    {msg.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-swin-red text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        <div className="flex-1 rounded-2xl border border-swin-charcoal/10 bg-white px-3.5 py-2 text-sm text-swin-charcoal dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                          {step}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-swin-charcoal/40 dark:text-slate-500">
              Assistant
            </span>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-swin-charcoal/10 bg-swin-ivory px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-swin-charcoal/50 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-swin-charcoal/50 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-swin-charcoal/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {remaining.length > 0 && (
        <div className="border-t border-swin-charcoal/10 px-5 py-3 dark:border-slate-700">
          <div className="flex flex-wrap gap-1.5">
            {remaining.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleQuickPrompt(p)}
                disabled={isLoading}
                className="rounded-full border border-swin-charcoal/15 bg-swin-ivory px-3 py-1 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red/50 hover:bg-swin-red hover:text-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-swin-red dark:hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-swin-charcoal/10 p-4 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-2xl border border-swin-charcoal/15 bg-swin-ivory px-4 py-2.5 text-sm text-swin-charcoal placeholder:text-swin-charcoal/40 focus:border-swin-red/50 focus:outline-none focus:ring-2 focus:ring-swin-red/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            style={{ maxHeight: '100px', overflowY: 'auto' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-swin-red text-white shadow-sm transition hover:bg-swin-red/90 disabled:opacity-40"
            aria-label="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.849-8.44.75.75 0 0 0 0-1.056A28.897 28.897 0 0 0 3.105 2.288Z" />
            </svg>
          </button>
        </form>
        <p className="mt-2 text-[10px] text-swin-charcoal/40 dark:text-slate-600">
          Still need help?{' '}
          <Link href="/dashboard/chat" className="font-semibold text-swin-red hover:underline">
            Chat with staff
          </Link>
          {' '}or email{' '}
          <a href="mailto:library@swinburne.edu.my" className="font-semibold text-swin-red hover:underline">
            library@swinburne.edu.my
          </a>
        </p>
      </div>
    </div>
  );
}
