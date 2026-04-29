'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CHAT_URL =
  'https://static.zdassets.com/web_widget/latest/liveChat.html?v=10' +
  '#key=swinburneuniversityoftechnologysarawakcampus.zendesk.com' +
  '&settings=JTdCJTIyd2ViV2lkZ2V0JTIyJTNBJTdCJTIyY2hhdCUyMiUzQSU3QiUyMnRpdGxlJTIyJTNBbnVsbCUyQyUyMm1lbnVPcHRpb25zJTIyJTNBJTdCJTIyZW1haWxUcmFuc2NyaXB0JTIyJTNBdHJ1ZSU3RCUyQyUyMmRlcGFydG1lbnRzJTIyJTNBJTdCJTdEJTJDJTIycHJlY2hhdEZvcm0lMjIlM0ElN0IlMjJkZXBhcnRtZW50TGFiZWwlMjIlM0FudWxsJTJDJTIyZ3JlZXRpbmclMjIlM0FudWxsJTdEJTJDJTIyb2ZmbGluZUZvcm0lMjIlM0ElN0IlMjJncmVldGluZyUyMiUzQW51bGwlN0QlMkMlMjJjb25jaWVyZ2UlMjIlM0ElN0IlMjJhdmF0YXJQYXRoJTIyJTNBbnVsbCUyQyUyMm5hbWUlMjIlM0FudWxsJTJDJTIydGl0bGUlMjIlM0FudWxsJTdEJTdEJTJDJTIyY29sb3IlMjIlM0ElN0IlMjJhcnRpY2xlTGlua3MlMjIlM0ElMjIlMjIlMkMlMjJidXR0b24lMjIlM0ElMjIlMjIlMkMlMjJoZWFkZXIlMjIlM0ElMjIlMjIlMkMlMjJsYXVuY2hlciUyMiUzQSUyMiUyMiUyQyUyMmxhdW5jaGVyVGV4dCUyMiUzQSUyMiUyMiUyQyUyMnJlc3VsdExpc3RzJTIyJTNBJTIyJTIyJTJDJTIydGhlbWUlMjIlM0FudWxsJTdEJTdEJTdE' +
  '&&locale=en-us&title=Web%20Widget%20Live%20Chat';

export default function ZendeskChatButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-swin-red underline-offset-4 hover:underline"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-end p-4 sm:items-center sm:justify-center">
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Chat panel */}
          <div
            className="relative z-10 flex flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={{ width: 360, height: 560, maxHeight: '90dvh', maxWidth: 'calc(100vw - 2rem)' }}
          >
            {/* Header bar */}
            <div className="flex flex-none items-center justify-between bg-swin-charcoal px-4 py-3">
              <div>
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/60">Live Support</span>
                <span className="block text-sm font-semibold text-white">Swinburne Help Desk</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Zendesk live chat iframe */}
            <iframe
              src={CHAT_URL}
              title="Swinburne Help Desk Live Chat"
              allow="microphone"
              className="flex-1 bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}
