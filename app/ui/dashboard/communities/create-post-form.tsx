'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createPost } from '@/app/dashboard/social/communities/actions';
import { Button } from '@/app/ui/button';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { ActionState } from '@/app/dashboard/action-state';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="!px-4 !py-2" aria-disabled={pending}>
            {pending ? (
                <span className="loading loading-spinner loading-xs"></span>
            ) : (
                <>
                    <span className="hidden sm:inline mr-1">Post</span>
                    <PaperAirplaneIcon className="h-4 w-4" />
                </>
            )}
        </Button>
    );
}

export default function CreatePostForm({ communityId }: { communityId: string }) {
    const initialState: ActionState = { status: 'idle', message: '' };
    const [state, dispatch] = useFormState(createPost, initialState);

    return (
        <form action={dispatch} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <input type="hidden" name="communityId" value={communityId} />

            <div className="mb-3">
                <input
                    name="title"
                    type="text"
                    placeholder="Post title (optional)"
                    className="w-full border-none bg-transparent p-0 text-lg font-semibold placeholder:text-gray-400 focus:ring-0 dark:text-white"
                />
            </div>

            <div className="mb-4">
                <textarea
                    name="body"
                    rows={3}
                    required
                    placeholder="Share something with the community..."
                    className="w-full resize-none border-none bg-transparent p-0 text-base placeholder:text-gray-400 focus:ring-0 dark:text-white"
                />
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                <div className="text-xs text-red-500">{state.status === 'error' && state.message}</div>
                <SubmitButton />
            </div>
        </form>
    );
}
