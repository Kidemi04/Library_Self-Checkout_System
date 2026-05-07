'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import MessageBubble, { type Role } from '@/app/ui/dashboard/readingAssistant/messageBubble';
import QuickPrompts from '@/app/ui/dashboard/readingAssistant/quickPrompts';
import Composer from '@/app/ui/dashboard/readingAssistant/composer';
import type { ReadingAssistantBook } from '@/app/ui/dashboard/readingAssistant/bookList';

type Turn = {
  id: string;
  role: Role;
  text: string;
  books?: ReadingAssistantBook[];
};

type ReadingAssistantProps = {
  userId: string;
  studentName?: string | null;
};

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function ReadingAssistant({ userId }: ReadingAssistantProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false); // assistant is replying
  const [hydrating, setHydrating] = useState(true);
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Load history on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/generalChatHistory');
        if (!res.ok) return;
        const { messages } = (await res.json()) as {
          messages: Array<{ id: string; sender: 'user' | 'assistant'; text: string; timestamp: string }>;
        };
        if (cancelled || !Array.isArray(messages)) return;
        setTurns(
          messages.map((m) => ({
            id: m.id,
            role: m.sender,
            text: m.text,
          })),
        );
      } catch {
        // silent — keep empty state
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Auto-scroll to bottom on new turns or when assistant starts replying.
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, busy]);

  const handleSend = useCallback(
    async (rawMessage?: string) => {
      const message = (rawMessage ?? draft).trim();
      if (!message || busy) return;

      const userTurn: Turn = { id: makeId(), role: 'user', text: message };
      setTurns((prev) => [...prev, userTurn]);
      setDraft('');
      setBusy(true);

      try {
        const res = await fetch('/api/reading-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { reply, books } = (await res.json()) as {
          reply: string;
          books?: ReadingAssistantBook[];
          intent: string;
        };
        const assistantTurn: Turn = {
          id: makeId(),
          role: 'assistant',
          text: reply,
          books,
        };
        setTurns((prev) => [...prev, assistantTurn]);
      } catch (err) {
        console.error('[reading-assistant] send error:', err);
        const errorTurn: Turn = {
          id: makeId(),
          role: 'assistant',
          text:
            "Sorry — I couldn't reach the AI just now. Please try again in a moment, or ask a librarian directly.",
        };
        setTurns((prev) => [...prev, errorTurn]);
      } finally {
        setBusy(false);
      }
    },
    [draft, busy],
  );

  const handleComposerSubmit = useCallback(() => {
    void handleSend();
  }, [handleSend]);

  const handlePromptPick = (prompt: string) => {
    setDraft(prompt);
    void handleSend(prompt);
  };

  const showQuickPrompts = !hydrating && turns.length === 0;

  return (
    <div className="rounded-card border border-hairline bg-surface-card p-6 dark:border-dark-hairline dark:bg-dark-surface-card">
      <div
        ref={feedRef}
        className="min-h-[420px] space-y-4 overflow-y-auto pb-2"
        style={{ maxHeight: 'calc(100vh - 360px)' }}
      >
        {showQuickPrompts ? (
          <QuickPrompts onPick={handlePromptPick} />
        ) : (
          <>
            {turns.map((t) => (
              <MessageBubble key={t.id} role={t.role} text={t.text} books={t.books} />
            ))}
            {busy && <MessageBubble role="assistant" text="" loading />}
          </>
        )}
      </div>

      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={handleComposerSubmit}
        disabled={busy}
      />
    </div>
  );
}
