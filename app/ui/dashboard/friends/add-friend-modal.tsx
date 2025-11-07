'use client';

import { useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/app/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/ui/dialog';
import { addFriend } from '@/app/dashboard/friends/actions';
import './error-observer';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Adding...' : 'Add Friend'}
    </Button>
  );
}

export function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  async function clientAction(formData: FormData) {
    try {
      await addFriend(formData);
      onClose();
    } catch (e) {
      if (e instanceof Error) {
        document.getElementById('error-message')?.setAttribute('data-error', e.message);
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        <form action={clientAction} className="space-y-4">
          <div>
            <label
              htmlFor="friendIdentifier"
              className="block text-sm font-medium text-gray-700"
            >
              Friend's email or username
            </label>
            <input
              type="text"
              id="friendIdentifier"
              name="friendIdentifier"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div id="error-message" data-error="" className="text-sm text-red-600 hidden" role="alert" />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
