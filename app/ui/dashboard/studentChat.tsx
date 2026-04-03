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
  const [onboardingComplete, setOnboardingComplete] = useState(!needsOnboarding);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
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

  const resetChat = () => {
    setMessages(buildInitialMessages(studentName ?? initialNameRef.current ?? null));
    setBookRecommendations([]);
    setActiveInterests([]);
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
    <section className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400/80">
          AI recommendations
        </p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Reading assistant</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300/80">
          Share what you want to read, and I will recommend books from the catalog.
        </p>
        </div>
        <button
          type="button"
          onClick={resetChat}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
        >
          Clear chat
        </button>
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
        className="mt-4 max-h-[55vh] flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:max-h-[60vh] lg:max-h-[65vh]"
      >
        <ol className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={clsx(
                'flex flex-col gap-1',
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
          className="mt-2 inline-flex items-center justify-center self-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
        >
          Scroll to latest
        </button>
      ) : null}

      {onboardingComplete && <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label htmlFor="student-chat-message" className="sr-only">
          Message
        </label>
        <textarea
          id="student-chat-message"
          name="message"
          rows={3}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Example: cozy mystery, short reads"
          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/50"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>
            {sendNotice ??
              'English only. Book recommendations only. Based on the current library catalog.'}
          </p>
          <button
            type="submit"
            disabled={isAssistantTyping}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900"
          >
            {isAssistantTyping ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </form>}

      {onboardingComplete && <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-black/20">
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {bookRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-black/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400/80">
                      Recommendation
                    </p>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rec.title ?? 'Untitled'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300/80">
                      {rec.author ?? 'Unknown author'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
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
      </div>}
    </section>
  );
}
