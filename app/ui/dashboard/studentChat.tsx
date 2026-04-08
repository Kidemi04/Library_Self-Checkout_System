'use client';

import { type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

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
};

type QuickPrompt = {
  id: string;
  label: string;
  message: string;
};

const quickPrompts: QuickPrompt[] = [];

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
}: {
  studentName?: string | null;
  needsOnboarding?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(studentName),
  );
  const [inputValue, setInputValue] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [sendNotice, setSendNotice] = useState<string | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [bookRecommendations, setBookRecommendations] = useState<RecommendationItem[]>([]);
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [linkedInSuggestions, setLinkedInSuggestions] = useState<LinkedInSuggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(!needsOnboarding);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recsRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    if (animKey === 0 || isFullscreen) return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    const timer = setTimeout(() => {
      recsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(timer);
  }, [animKey, isFullscreen]);

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
    setBookRecommendations([]);
    setActiveInterests([]);
    setLinkedInSuggestions([]);
    setSendNotice(null);
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
        body: JSON.stringify({ message: content }),
      });

      const data = (await response.json()) as RecommendationResponse;
      const replyText =
        response.ok && data?.reply ? data.reply : data?.reply ?? buildErrorReply();

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        },
      ]);

      setBookRecommendations(data?.recommendations ?? []);
      setActiveInterests(data?.interests ?? []);
      setLinkedInSuggestions(data?.linkedInSuggestions ?? []);
      if ((data?.recommendations ?? []).length > 0) setAnimKey((k) => k + 1);

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
      setBookRecommendations([]);
      setActiveInterests([]);
      setLinkedInSuggestions([]);
      setSendNotice('Unable to send right now. Please try again.');
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await sendMessage(inputValue)) {
      setInputValue('');
    }
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
    sendMessage(inputValue).then((sent) => {
      if (sent) {
        setInputValue('');
      }
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
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900'
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
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
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

      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            onClick={() => handleQuickPrompt(prompt)}
          >
            {prompt.label}
          </button>
        ))}
      </div>

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
                    ? 'rounded-br-md bg-slate-900 text-white shadow-slate-900/20 dark:bg-slate-200 dark:text-slate-900 dark:shadow-black/30'
                    : 'rounded-bl-md border border-slate-200 bg-slate-100 text-slate-900 shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:shadow-black/30',
                )}
              >
                {message.text.split('\n').map((line, lineIndex) => (
                  <p key={`${message.id}-${lineIndex}`} className={lineIndex > 0 ? 'mt-1' : undefined}>
                    {line}
                  </p>
                ))}
              </div>
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

      {onboardingComplete && <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label htmlFor="student-chat-message" className="sr-only">
          Message
        </label>
        <textarea
          ref={textareaRef}
          id="student-chat-message"
          name="message"
          rows={3}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: cozy mystery, short reads"
          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/50"
        />
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          {(!isFullscreen || sendNotice) && (
            <p>
              {sendNotice ??
                'English only. Book recommendations only. Based on the current library catalog.'}
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

      {!isFullscreen && onboardingComplete && <>
        <style>{`
          @keyframes recSectionIn {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes recCardIn {
            from { opacity: 0; transform: translateY(18px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .rec-section-anim {
            animation: recSectionIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .rec-card-anim {
            animation: recCardIn 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        `}</style>
        <div ref={recsRef} className="rec-section-anim mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400/80">
              Your recommendations
            </p>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Books matched to your interests
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300/80">
              Send a message to refresh the list.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {activeInterests.length ? (
            activeInterests.map((token) => (
              <span
                key={token}
                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {token}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300/80">
              Send a message to see the key interests we detected.
            </p>
          )}
        </div>

        {bookRecommendations.length ? (
          <div key={animKey} className="mt-4 grid gap-3 sm:grid-cols-2">
            {bookRecommendations.map((rec, index) => (
              <div
                key={rec.id}
                className="rec-card-anim group flex cursor-default flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-red-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20 dark:hover:border-red-900/60 dark:hover:shadow-red-950/20"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400/80">
                      Recommendation
                    </p>
                    <h4 className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-red-600 dark:text-slate-100 dark:group-hover:text-red-400">
                      {rec.title ?? 'Untitled'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300/80">
                      {rec.author ?? 'Unknown author'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors group-hover:bg-red-50 group-hover:text-red-600 dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-red-950/40 dark:group-hover:text-red-400">
                    {rec.availableCopies} available
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300/90">
                  {rec.reason ?? 'Good match based on your interests'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300/80">
            No recommendations yet. Mention a genre, topic, or mood to get started.
          </div>
        )}

        {linkedInSuggestions.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
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
      </div>
    </>}
    </section>
  );
}
