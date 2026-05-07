'use client';

import { useState } from 'react';
import clsx from 'clsx';
import HelpNavigator from '@/app/ui/dashboard/help/helpNavigator';
import HelpViewer from '@/app/ui/dashboard/help/helpViewer';

type Mode = 'chat' | 'faq' | 'find-book';

type HelpCentreLayoutProps = {
  initialMode: Mode;
  initialTopicSlug: string | null;
  userId: string;
  studentName: string | null;
};

export default function HelpCentreLayout({
  initialMode,
  initialTopicSlug,
  userId,
  studentName,
}: HelpCentreLayoutProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [topicSlug, setTopicSlug] = useState<string | null>(initialTopicSlug);
  const [mobileTab, setMobileTab] = useState<'navigator' | 'viewer'>(
    initialMode === 'chat' ? 'viewer' : 'navigator',
  );

  const handleSelectFaq = (slug: string) => {
    setMode('faq');
    setTopicSlug(slug);
    setMobileTab('viewer');
  };

  const handleSelectFindBook = () => {
    setMode('find-book');
    setTopicSlug(null);
    setMobileTab('viewer');
  };

  const handleBackToChat = () => {
    setMode('chat');
    setTopicSlug(null);
    // Stay on whichever mobile tab the user is on.
  };

  return (
    <div className="space-y-4">
      {/* Mobile tab bar — visible only on mobile */}
      <div
        role="tablist"
        aria-label="Help section"
        className="flex gap-1 rounded-btn border border-hairline bg-surface-card p-1 md:hidden dark:border-dark-hairline dark:bg-dark-surface-card"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'navigator'}
          onClick={() => setMobileTab('navigator')}
          className={clsx(
            'flex-1 rounded-btn px-3 py-2 font-sans text-button transition',
            mobileTab === 'navigator'
              ? 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark'
              : 'text-muted dark:text-on-dark-soft',
          )}
        >
          Quick Answers
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'viewer'}
          onClick={() => setMobileTab('viewer')}
          className={clsx(
            'flex-1 rounded-btn px-3 py-2 font-sans text-button transition',
            mobileTab === 'viewer'
              ? 'bg-surface-cream-strong text-ink dark:bg-dark-surface-strong dark:text-on-dark'
              : 'text-muted dark:text-on-dark-soft',
          )}
        >
          Chat
        </button>
      </div>

      {/* Two-column grid (desktop) / single-column (mobile) */}
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className={mobileTab === 'navigator' ? '' : 'hidden md:block'}>
          <HelpNavigator
            mode={mode}
            topicSlug={topicSlug}
            onSelectFaq={handleSelectFaq}
            onSelectFindBook={handleSelectFindBook}
          />
        </div>

        <div className={mobileTab === 'viewer' ? '' : 'hidden md:block'}>
          <HelpViewer
            mode={mode}
            topicSlug={topicSlug}
            userId={userId}
            studentName={studentName}
            onBackToChat={handleBackToChat}
          />
        </div>
      </div>
    </div>
  );
}
