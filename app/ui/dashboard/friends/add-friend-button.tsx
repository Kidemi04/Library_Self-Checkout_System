"use client";

import { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/ui/dialog';
import { addFriend } from '@/app/dashboard/friends/actions';
import { Input } from '@/app/ui/input';
import { cn } from '@/app/lib/utils';

export function AddFriendButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn('rounded-2xl bg-slate-900 text-white shadow-lg hover:bg-slate-800', className)}>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-3xl border-none bg-transparent p-0 shadow-2xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white/90 to-slate-50 p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)]" />
          <div className="relative space-y-2 pb-4">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Invite a friend
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Use their Swinburne email address to connect and start sharing recommendations.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form
            action={async (formData) => {
              await addFriend(formData);
              setOpen(false);
            }}
            className="relative space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="friendIdentifier" className="text-sm font-semibold text-slate-700">
                Friend’s email or username
              </label>
              <Input
                id="friendIdentifier"
                type="text"
                name="friendIdentifier"
                placeholder="person@swinburne.edu.my or @campusname"
                className="h-12 rounded-2xl border-slate-200 bg-white/80 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-500"
                required
              />
              <p className="text-xs text-slate-500">
                Invitations are limited to campus accounts. Try their full email or username.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              >
                Not now
              </Button>
              <Button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 shadow-lg hover:from-amber-300 hover:to-pink-400"
              >
                Send invitation
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
