'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function CreateCommunityModal({
    open,
    onClose,
    children,
}: Props) {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b px-6 py-4 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Community</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Start a new group for people to join.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>,
        document.body
    );
}
