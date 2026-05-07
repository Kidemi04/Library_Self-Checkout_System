'use client';

import { memo } from 'react';
import ChatAssistant from '@/app/ui/dashboard/chatAssistant';
import StudentChat from '@/app/ui/dashboard/studentChat';
import FaqReader from '@/app/ui/dashboard/help/faqReader';

type Mode = 'chat' | 'faq' | 'find-book';

type HelpViewerProps = {
  mode: Mode;
  topicSlug: string | null;
  userId: string;
  studentName: string | null;
  onBackToChat: () => void;
};

const MemoChatAssistant = memo(ChatAssistant);
const MemoStudentChat = memo(StudentChat);

export default function HelpViewer({
  mode,
  topicSlug,
  userId,
  studentName,
  onBackToChat,
}: HelpViewerProps) {
  return (
    <div className="space-y-0">
      <div className={mode === 'chat' ? '' : 'hidden'}>
        <MemoChatAssistant userId={userId} />
      </div>

      <div className={mode === 'faq' ? '' : 'hidden'}>
        <FaqReader
          topicSlug={topicSlug}
          onAskAi={onBackToChat}
          onBack={onBackToChat}
        />
      </div>

      <div className={mode === 'find-book' ? '' : 'hidden'}>
        <MemoStudentChat studentName={studentName} userId={userId} />
      </div>
    </div>
  );
}
