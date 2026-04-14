'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import PlaceHoldButton from '@/app/ui/dashboard/placeHoldButton';

type RecommendationItem = {
  id: string;
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  availableCopies: number;
  totalCopies: number;
  reason: string;
};

type LinkedInSuggestion = {
  title: string;
  query: string;
};

type RecommendationResponse = {
  ok?: boolean;
  kind?:
    | 'recommendations'
    | 'clarify'
    | 'greeting'
    | 'reject'
    | 'no_matches'
    | 'error'
    | 'rate_limited';
  reply?: string;
  recommendations?: RecommendationItem[];
  linkedInSuggestions?: LinkedInSuggestion[];
  interests?: string[];
  summary?: string | null;
  followUpQuestion?: string | null;
};

type ChatMessage = {
  id: string;
  sender: 'student' | 'assistant';
  text: string;
  timestamp: number;
  recommendations?: RecommendationItem[];
};

type QuickPrompt = {
  id: string;
  label: string;
  message: string;
};

const quickPrompts: QuickPrompt[] = [
  {
    id: 'faculty',
    label: '📚 Recommend for my faculty',
    message: 'Recommend books based on my faculty and interests',
  },
  {
    id: 'assignment',
    label: '📝 Books for my assignment',
    message: 'I need book recommendations for my academic assignment',
  },
  {
    id: 'available',
    label: '✅ Show me what\'s available now',
    message: 'What books are available to borrow right now?',
  },
  {
    id: 'interesting',
    label: '✨ Just something interesting',
    message: 'Suggest something interesting I might enjoy reading',
  },
];

const buildGreeting = (name?: string | null) => {
  const friendlyName =
    name && name.trim().length > 0 ? name.trim().split(/\s+/)[0] : 'there';
  return `Hi ${friendlyName}! Tell me what you like to read and I will recommend books from the catalog.`;
};

const buildInitialMessages = (name?: string | null): ChatMessage[] => {
  const now = Date.now();
  return [
    {
      id: 'assistant-1',
      sender: 'assistant',
      text: buildGreeting(name),
      timestamp: now - 120000,
    },
    {
      id: 'assistant-2',
      sender: 'assistant',
      text: 'English only. Book recommendations only. Share genres, topics, mood, or course units.',
      timestamp: now - 60000,
    },
  ];
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const buildErrorReply = () =>
  'Sorry, I could not reach the recommendation service. Please try again in a moment.';

const formatTimestamp = (timestamp: number) => {
  try {
    return new Intl.DateTimeFormat('en-MY', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleTimeString();
  }
};

const ONBOARDING_TAGS = [
  'programming', 'data science', 'machine learning', 'software engineering',
  'algorithms', 'networking', 'databases', 'operating systems',
  'web development', 'cybersecurity',
  'business', 'marketing', 'finance', 'accounting', 'economics', 'management',
  'engineering', 'mathematics', 'statistics', 'physics',
  'design', 'multimedia', 'art',
  'english', 'writing', 'communication',
  'robotics', 'electronics',
];

export default function StudentChat({
  studentName,
  needsOnboarding = false,
  userId,
}: {
  studentName?: string | null;
  needsOnboarding?: boolean;
  userId?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(studentName),
  );
  const [inputValue, setInputValue] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [sendNotice, setSendNotice] = useState<string | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [linkedInSuggestions, setLinkedInSuggestions] = useState<LinkedInSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(!needsOnboarding);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [aiProvider, setAiProvider] = useState<'lmstudio' | 'gemini'>('lmstudio');
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastSentAtRef = useRef<number>(0);
  const initialNameRef = useRef(studentName);

  useEffect(() => {
    const nextGreeting = buildGreeting(studentName);
    setMessages((current) => {
      if (!current.length) {
        return buildInitialMessages(studentName);
      }
      const [first, ...rest] = current;
      if (first.sender !== 'assistant') {
        return current;
      }
      if (first.text === nextGreeting) {
        return current;
      }
      return [{ ...first, text: nextGreeting }, ...rest];
    });
  }, [studentName]);

  useEffect(() => {
    if (initialNameRef.current == null) {
      initialNameRef.current = studentName ?? null;
    }
  }, [studentName]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleCopy = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(() => undefined);
  };

  const handleEdit = (message: ChatMessage) => {
    setInputValue(message.text);
    setTimeout(() => {
      textareaRef.current?.focus();
      const len = message.text.length;
      textareaRef.current?.setSelectionRange(len, len);
    }, 0);
  };

  const resetChat = () => {
    setMessages(buildInitialMessages(studentName ?? initialNameRef.current ?? null));
    setLinkedInSuggestions([]);
    setSendNotice(null);
    setShowQuickPrompts(true);
    setStickToBottom(true);
    setInputValue('');
    setIsAssistantTyping(false);
    lastSentAtRef.current = 0;
  };

  const handleSaveInterests = async () => {
    if (selectedTags.size === 0 || isSavingInterests) return;
    setIsSavingInterests(true);
    try {
      await fetch('/api/user/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: Array.from(selectedTags) }),
      });
    } catch {
      // Non-fatal: proceed even if save fails
    } finally {
      setIsSavingInterests(false);
      setOnboardingComplete(true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const scrollToBottom = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const scheduleScrollToBottom = () => {
    if (typeof requestAnimationFrame === 'undefined') {
      scrollToBottom();
      return;
    }
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  };

  useEffect(() => {
    if (!stickToBottom) return;
    scrollToBottom();
  }, [messages, isAssistantTyping, stickToBottom]);

  const handleScroll = () => {
    if (!messagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 40;
    setStickToBottom(nearBottom);
  };

  const sendMessage = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    const now = Date.now();
    if (isAssistantTyping) {
      setSendNotice('Please wait for the current reply.');
      return false;
    }
    if (now - lastSentAtRef.current < 1200) {
      setSendNotice('Please wait a moment before sending another message.');
      return false;
    }
    setSendNotice(null);

    const newMessage: ChatMessage = {
      id: createId(),
      sender: 'student',
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowQuickPrompts(false);
    setStickToBottom(true);
    scheduleScrollToBottom();
    lastSentAtRef.current = now;
    await triggerAssistantReply(trimmed);
    return true;
  };

  const triggerAssistantReply = async (content: string) => {
    setIsAssistantTyping(true);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, provider: aiProvider }),
      });

      const data = (await response.json()) as RecommendationResponse;
      const replyText =
        response.ok && data?.reply ? data.reply : data?.reply ?? buildErrorReply();

      const recs = data?.recommendations ?? [];
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          text: replyText,
          timestamp: Date.now(),
          recommendations: recs.length ? recs : undefined,
        },
      ]);

      setLinkedInSuggestions(data?.linkedInSuggestions ?? []);

      if (response.status === 429 && data?.reply) {
        setSendNotice(data.reply);
      } else {
        setSendNotice(null);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          text: buildErrorReply(),
          timestamp: Date.now(),
        },
      ]);
      setLinkedInSuggestions([]);
      setSendNotice('Unable to send right now. Please try again.');
    } finally {
      setIsAssistantTyping(false);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.focus();
        }
      }, 50);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputValue;
    setInputValue('');
    const sent = await sendMessage(value);
    if (!sent) setInputValue(value);
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    sendMessage(prompt.message);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'ArrowUp' && !event.shiftKey && inputValue.trim() === '') {
      const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.sender === 'student')?.text;
      if (lastUserMessage) {
        event.preventDefault();
        setInputValue(lastUserMessage);
      }
      return;
    }

    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    const value = inputValue;
    setInputValue('');
    sendMessage(value).then((sent) => {
      if (!sent) setInputValue(value);
    });
  };

  return (
    <section
      className={clsx(
        'flex flex-col p-5 shadow-sm',
        isFullscreen
          ? 'fixed inset-0 z-[60] overflow-y-auto rounded-none border-0 bg-white dark:bg-slate-950'
          : 'h-full rounded-3xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/20',
      )}
    >
      <div className={clsx('flex flex-wrap items-start gap-3', isFullscreen ? 'justify-end' : 'justify-between')}>
        {!isFullscreen && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400/80">
              AI recommendations
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reading assistant</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300/80">
              Share what you want to read, and I will recommend books from the catalog.
            </p>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setAiProvider('lmstudio')}
              className={clsx(
                'px-3 py-2 text-xs font-semibold transition',
                aiProvider === 'lmstudio'
                  ? 'bg-swin-red text-white dark:bg-swin-red dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              Local AI
            </button>
            <button
              type="button"
              onClick={() => setAiProvider('gemini')}
              className={clsx(
                'px-3 py-2 text-xs font-semibold transition',
                aiProvider === 'gemini'
                  ? 'bg-swin-red text-white dark:bg-swin-red dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              )}
            >
              Gemini
            </button>
          </div>
          <button
            type="button"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            onClick={() => setIsFullscreen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-red-500 dark:hover:text-red-400"
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h2a.75.75 0 0 1 0 1.5h-2A2.25 2.25 0 0 1 3 9.75v-5.5Zm9.47 2.22a.75.75 0 0 1 1.06 0l.97.97V5.75a.75.75 0 0 1 1.5 0V9a.75.75 0 0 1-.75.75h-3.25a.75.75 0 0 1 0-1.5h1.69l-.97-.97a.75.75 0 0 1 0-1.06Zm-9.22 8.44a.75.75 0 0 1 1.06-1.06l.97.97v-1.69a.75.75 0 0 1 1.5 0V17a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1 0-1.5h1.69l-.97-.97Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M13.28 7.78l3.22-3.22v2.69a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.69l-3.22 3.22a.75.75 0 1 0 1.06 1.06ZM2 17.25v-4.5a.75.75 0 0 1 1.5 0v2.69l3.22-3.22a.75.75 0 0 1 1.06 1.06L4.56 16.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={resetChat}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-red-500 dark:hover:text-red-400"
          >
            Clear chat
          </button>
        </div>
      </div>

      {!onboardingComplete && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400/80">
            Get started
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
            Pick topics you are interested in
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/80">
            Choose at least one. We will use these to personalize your recommendations.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {ONBOARDING_TAGS.map((tag) => {
              const active = selectedTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-swin-red dark:bg-swin-red dark:text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={selectedTags.size === 0 || isSavingInterests}
              onClick={handleSaveInterests}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-swin-red dark:text-white dark:hover:bg-swin-red/90"
            >
              {isSavingInterests
                ? 'Saving...'
                : `Continue with ${selectedTags.size} topic${selectedTags.size !== 1 ? 's' : ''}`}
            </button>
            <button
              type="button"
              onClick={() => setOnboardingComplete(true)}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}


      {onboardingComplete && <div
        ref={messagesRef}
        onScroll={handleScroll}
        className={clsx(
          'mt-4 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60',
          isFullscreen ? 'max-h-[calc(100vh-16rem)]' : 'max-h-[55vh] sm:max-h-[60vh] lg:max-h-[65vh]',
        )}
      >
        <ol className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={clsx(
                'group flex flex-col gap-1',
                message.sender === 'student' ? 'items-end' : 'items-start',
              )}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>{message.sender === 'student' ? 'You' : 'Library Assistant'}</span>
                <span className="text-slate-400 dark:text-slate-500">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div
                className={clsx(
                  'w-full max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm md:max-w-[70%]',
                  message.sender === 'student'
                    ? 'rounded-br-md bg-slate-900 text-white shadow-slate-900/20 dark:bg-slate-700 dark:text-slate-100 dark:shadow-black/30'
                    : 'rounded-bl-md border border-slate-200 bg-slate-100 text-slate-900 shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/30',
                )}
              >
                {message.text.split('\n').map((line, lineIndex) => (
                  <p key={`${message.id}-${lineIndex}`} className={lineIndex > 0 ? 'mt-1' : undefined}>
                    {line}
                  </p>
                ))}
              </div>
              {message.sender === 'assistant' && message.recommendations?.length ? (
                <div className="mt-2 w-full max-w-[85%] space-y-2 md:max-w-[70%]">
                  {message.recommendations.map((rec) => {
                    const searchUrl = `/dashboard/book/items?q=${encodeURIComponent(rec.title)}`;
                    return (
                      <div
                        key={rec.id}
                        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                      >
                        {/* Cover image */}
                        <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          {rec.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rec.coverImageUrl}
                              alt={rec.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-slate-400 dark:text-slate-500">
                              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
                            </svg>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={searchUrl}
                            className="block text-sm font-semibold text-slate-900 hover:text-red-600 dark:text-slate-100 dark:hover:text-red-400 line-clamp-2 leading-snug"
                          >
                            {rec.title}
                          </Link>
                          {rec.author && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">{rec.author}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                            <span className={clsx(
                              'text-xs font-medium',
                              rec.availableCopies > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-500 dark:text-red-400',
                            )}>
                              {rec.availableCopies > 0
                                ? `${rec.availableCopies} / ${rec.totalCopies} available`
                                : 'All copies checked out'}
                            </span>
                            {rec.availableCopies > 0 ? (
                              <Link
                                href={searchUrl}
                                className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 transition"
                              >
                                Borrow
                              </Link>
                            ) : (
                              <PlaceHoldButton
                                bookId={rec.id}
                                patronId={userId}
                                bookTitle={rec.title}
                              />
                            )}
                          </div>
                          {/* YouTube + Google search links */}
                          <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Search on YouTube"
                              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                              YouTube
                            </a>
                            <span className="text-slate-200 dark:text-slate-700">|</span>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(rec.title + ' book')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Search on Google"
                              className="flex items-center gap-1 text-[11px] font-medium text-slate-400 transition hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                              </svg>
                              Google
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {message.sender === 'student' && (
                <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    title="Copy message"
                    onClick={() => handleCopy(message)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    {copiedId === message.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-emerald-500">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                        <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    title="Edit message"
                    onClick={() => handleEdit(message)}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                    </svg>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
        {isAssistantTyping ? (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 animate-ping rounded-full bg-slate-400 dark:bg-slate-500" />
            Library Assistant is typing...
          </div>
        ) : null}
      </div>}

      {onboardingComplete && !stickToBottom ? (
        <button
          type="button"
          onClick={() => {
            scrollToBottom();
            setStickToBottom(true);
          }}
          className="mt-2 inline-flex items-center justify-center self-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-red-500 dark:hover:text-red-400"
        >
          Scroll to latest
        </button>
      ) : null}

      {onboardingComplete && showQuickPrompts && (
        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-red-500/50 dark:hover:bg-red-950/20 dark:hover:text-red-400"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {onboardingComplete && <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label htmlFor="student-chat-message" className="sr-only">
          Message
        </label>
        <textarea
          ref={textareaRef}
          id="student-chat-message"
          name="message"
          rows={1}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            event.target.style.height = 'auto';
            event.target.style.height = `${event.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question or search for books..."
          style={{ resize: 'none', overflow: 'hidden', minHeight: '44px', maxHeight: '160px' }}
          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/50"
        />
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          {(!isFullscreen || sendNotice) && (
            <p>
              {sendNotice ??
                'English only. Ask academic questions or search for books from the library catalog.'}
            </p>
          )}
          <button
            type="submit"
            disabled={isAssistantTyping}
            className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-600 dark:hover:bg-red-700 dark:focus-visible:ring-red-500 dark:focus-visible:ring-offset-slate-900"
          >
            {isAssistantTyping ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </form>}

      {!isFullscreen && onboardingComplete && linkedInSuggestions.length > 0 && (
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400/80">
            Go deeper
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">
            Courses on LinkedIn Learning
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Suggested based on your interests. Opens LinkedIn Learning search.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {linkedInSuggestions.map((suggestion) => (
              <a
                key={suggestion.query}
                href={`https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(suggestion.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-[#0A66C2] hover:text-[#0A66C2] dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-[#0A66C2] dark:hover:text-[#70B5F9]"
              >
                <span>{suggestion.title}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 opacity-50">
                  <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4zm6.5-1a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.72 3.72a.75.75 0 11-1.06-1.06l3.72-3.72H10.75z" clipRule="evenodd" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
