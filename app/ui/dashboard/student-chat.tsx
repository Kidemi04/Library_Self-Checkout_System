'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

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

const quickPrompts: QuickPrompt[] = [
  {
    id: 'borrow',
    label: 'Borrowing rules',
    message: 'Can you remind me how long I can borrow a book for?',
  },
  {
    id: 'return',
    label: 'After-hours returns',
    message: 'How do I return my books when the desk is closed?',
  },
  {
    id: 'overdue',
    label: 'Overdue fines',
    message: 'What are the overdue fines if I miss my due date?',
  },
  {
    id: 'hold',
    label: 'Place a hold',
    message: 'How do I place a hold on a book that is already loaned out?',
  },
];

const buildGreeting = (name?: string | null) => {
  const friendlyName =
    name && name.trim().length > 0 ? name.trim().split(/\s+/)[0] : 'there';
  return `Hi ${friendlyName}! I\'m the Library Assistant. Tell me what you\'re working on and I\'ll guide you or connect you with a librarian.`;
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
      text: 'Need a quick answer? Try the shortcuts below or send a question. A librarian monitors this chat during staffed hours.',
      timestamp: now - 60000,
    },
  ];
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const generateAssistantReply = (raw: string) => {
  const normalized = raw.toLowerCase();
  if (/borrow|loan|checkout|due date/.test(normalized)) {
    return 'Students can borrow up to 8 items for 14 days. You can renew twice inside the Active loans list as long as no one else has a hold on the title.';
  }
  if (/return|check in|drop/i.test(normalized)) {
    return 'Returns are accepted 24/7 via the foyer bins. Scan the item before dropping it in so the timestamp is captured, then you will see it disappear from Active loans within a few minutes.';
  }
  if (/fine|overdue|fee|late/.test(normalized)) {
    return 'There is a 3 day grace period. After that the system charges RM1 per item per day. Pay inside the library or email us if you need to discuss an appeal.';
  }
  if (/hold|reserve|queue/.test(normalized)) {
    return 'Open the Catalogue, select the title, and press "Place hold". We will email you when it is ready for pickup. Holds expire after 48 hours.';
  }
  if (/card|scan|scanner|barcode/.test(normalized)) {
    return 'If the scanner is not reading your card or barcode, switch to manual entry in the form and type the student ID or book barcode. Let staff know if the device needs maintenance.';
  }
  return 'Thanks for the details! I just logged your message for a librarian. Expect a response in your student email soon, or continue chatting here if you have more info to add.';
};

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

export default function StudentChat({
  studentName,
}: {
  studentName?: string | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(studentName),
  );
  const [inputValue, setInputValue] = useState('');
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const replyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimeout.current) {
        clearTimeout(replyTimeout.current);
      }
    };
  }, []);

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
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, isAssistantTyping]);

  const sendMessage = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return false;
    const newMessage: ChatMessage = {
      id: createId(),
      sender: 'student',
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newMessage]);
    triggerAssistantReply(trimmed);
    return true;
  };

  const triggerAssistantReply = (content: string) => {
    setIsAssistantTyping(true);
    if (replyTimeout.current) {
      clearTimeout(replyTimeout.current);
    }
    replyTimeout.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          sender: 'assistant',
          text: generateAssistantReply(content),
          timestamp: Date.now(),
        },
      ]);
      setIsAssistantTyping(false);
    }, 900);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendMessage(inputValue)) {
      setInputValue('');
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    sendMessage(prompt.message);
  };

  return (
    <section className="flex h-full flex-col rounded-3xl border border-swin-charcoal/10 bg-white p-5 shadow-lg shadow-swin-charcoal/5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-swin-charcoal/60">
          Live support
        </p>
        <h2 className="text-xl font-semibold text-swin-charcoal">Chatbox</h2>
        <p className="text-sm text-swin-charcoal/70">
          Ask anything about borrowing, returns, fines, or using the library.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            className="rounded-full border border-swin-charcoal/15 bg-swin-ivory px-3 py-1 text-xs font-semibold text-swin-charcoal transition hover:border-swin-red/50 hover:text-swin-red"
            onClick={() => handleQuickPrompt(prompt)}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <div
        ref={messagesRef}
        className="mt-4 flex-1 overflow-y-auto rounded-2xl border border-swin-charcoal/10 bg-swin-ivory/40 p-4"
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
              <div
                className={clsx(
                  'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide',
                  message.sender === 'student'
                    ? 'text-swin-red/80'
                    : 'text-swin-charcoal/60',
                )}
              >
                <span>{message.sender === 'student' ? 'You' : 'Library Assistant'}</span>
                <span className="text-swin-charcoal/50">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              <div
                className={clsx(
                  'w-full max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm md:max-w-[70%]',
                  message.sender === 'student'
                    ? 'rounded-br-md bg-swin-red text-white shadow-swin-red/30'
                    : 'rounded-bl-md border border-swin-charcoal/10 bg-white text-swin-charcoal shadow-swin-charcoal/10',
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
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-swin-charcoal/60">
            <span className="h-2 w-2 animate-ping rounded-full bg-swin-red" />
            Library Assistant is typing...
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label htmlFor="student-chat-message" className="sr-only">
          Message
        </label>
        <textarea
          id="student-chat-message"
          name="message"
          rows={3}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Type your question here..."
          className="w-full rounded-2xl border border-swin-charcoal/15 bg-white p-3 text-sm text-swin-charcoal shadow-inner shadow-white outline-none transition focus:border-swin-red focus:ring-2 focus:ring-swin-red/30"
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-swin-charcoal/60">
          <p>Responses arrive in-app and via email if you leave the chat.</p>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-swin-red px-4 py-2 text-sm font-semibold text-white shadow-swin-red/40 transition hover:bg-swin-red/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-swin-red focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Send message
          </button>
        </div>
      </form>
    </section>
  );
}
