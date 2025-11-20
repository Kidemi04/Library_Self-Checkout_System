'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createCommunity } from '@/app/dashboard/communities/actions';
import { Button } from '@/app/ui/button';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ActionState } from '@/app/dashboard/action-state';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full justify-center" aria-disabled={pending}>
            {pending ? 'Creating...' : 'Create Community'}
        </Button>
    );
}

export default function CreateCommunityForm({ onSuccess }: { onSuccess?: () => void }) {
    const initialState: ActionState = { status: 'idle', message: '' };
    const [state, dispatch] = useFormState(createCommunity, initialState);

    if (state.status === 'success' && onSuccess) {
        // Small delay to show success state or just close immediately
        setTimeout(onSuccess, 500);
    }

    return (
        <form action={dispatch} className="space-y-4">
            <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Community Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Sci-Fi Lovers"
                    className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="What is this community about?"
                    className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            <div>
                <label htmlFor="visibility" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Visibility
                </label>
                <select
                    id="visibility"
                    name="visibility"
                    className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                    <option value="public">Public - Anyone can join</option>
                    <option value="private">Private - Invite only</option>
                </select>
            </div>

            {state.status === 'error' && (
                <div className="flex items-end space-x-1" aria-live="polite" aria-atomic="true">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-500">{state.message}</p>
                </div>
            )}

            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
    );
}
