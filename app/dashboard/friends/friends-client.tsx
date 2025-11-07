'use client';

import { useOptimistic } from 'react';
import type { Friend, FriendStatus, FriendSuggestion } from '@/app/lib/supabase/friends';
import { Avatar } from '@/app/ui/avatar';
import { Button } from '@/app/ui/button';
import { AddFriendButton } from '@/app/ui/dashboard/friends/add-friend-button';
import { handleFriendRequest } from '@/app/dashboard/friends/actions';
import { FriendSuggestionList } from '@/app/ui/dashboard/friends/friend-suggestions';

interface FriendsClientProps {
  initialFriends: Friend[];
  initialSuggestions: FriendSuggestion[];
}

export default function FriendsClient({
  initialFriends,
  initialSuggestions,
}: FriendsClientProps) {
  const [friends, updateFriend] = useOptimistic(
    initialFriends,
    (state, update: { id: string; status: FriendStatus }) =>
      state.map((friend) =>
        friend.id === update.id ? { ...friend, status: update.status } : friend,
      ),
  );

  const accepted = friends.filter((friend) => friend.status === 'accepted');
  const incomingRequests = friends.filter(
    (friend) => friend.status === 'pending' && friend.direction === 'incoming',
  );
  const outgoingRequests = friends.filter(
    (friend) => friend.status === 'pending' && friend.direction === 'outgoing',
  );

  const stats = [
    { label: 'Connections', value: accepted.length, tone: 'text-white' },
    { label: 'Incoming requests', value: incomingRequests.length, tone: 'text-amber-200' },
    { label: 'Sent requests', value: outgoingRequests.length, tone: 'text-slate-200' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-2xl sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 sm:text-sm">
              Community
            </p>
            <h1 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
              Curate a circle that inspires your reading
            </h1>
            <p className="text-sm text-slate-300">
              Connect with classmates, share recommendations, and see what the campus is reading.
            </p>
          </div>
          <AddFriendButton className="w-full self-start rounded-2xl bg-gradient-to-r from-amber-400 to-pink-500 text-slate-900 hover:from-amber-300 hover:to-pink-400 sm:w-auto" />
        </div>
        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-wide text-slate-300">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="rounded-[28px] bg-white/95 p-5 shadow-xl ring-1 ring-slate-200 sm:p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Connections</h2>
              <p className="text-sm text-slate-500">
                Manage your current friends and respond to pending requests.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {friends.map((friend) => {
              const displayName =
                friend.friend?.profile?.displayName ??
                friend.friend?.email ??
                'Unknown user';
              const isPending = friend.status === 'pending';
              const isIncoming = friend.direction === 'incoming';
              const badge =
                friend.status === 'accepted'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700';

              return (
                <div
                  key={friend.id}
                  className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={friend.friend?.profile?.avatarUrl}
                      name={displayName}
                      fallback={displayName.charAt(0)}
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{displayName}</p>
                      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs ${badge}`}>
                        {friend.status === 'accepted'
                          ? 'Friend'
                          : isIncoming
                            ? 'Incoming request'
                            : 'Request sent'}
                      </span>
                    </div>
                  </div>

                  {isPending && isIncoming && (
                    <form
                      action={async (formData) => {
                        const intent = formData.get('action');
                        const nextStatus: FriendStatus =
                          intent === 'accept' ? 'accepted' : 'declined';
                        updateFriend({
                          id: friend.id,
                          status: nextStatus,
                        });
                        await handleFriendRequest(formData);
                      }}
                      className="flex w-full gap-2 sm:w-auto"
                    >
                      <input type="hidden" name="requestId" value={friend.id} />
                      <Button
                        type="submit"
                        name="action"
                        value="decline"
                        variant="outline"
                        className="w-full rounded-xl border-slate-200 text-slate-600 sm:w-auto"
                      >
                        Decline
                      </Button>
                      <Button type="submit" name="action" value="accept" className="w-full rounded-xl sm:w-auto">
                        Accept
                      </Button>
                    </form>
                  )}
                </div>
              );
            })}

            {friends.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-slate-500">
                <p className="font-medium text-slate-700">Your network is waiting.</p>
                <p className="text-sm">
                  Send your first invitation with the <span className="font-semibold">Add Friend</span>{' '}
                  button above.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-slate-900 p-5 text-white shadow-2xl ring-1 ring-slate-800 sm:p-6">
          <div className="mb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Discover</p>
            <h2 className="text-2xl font-semibold">Suggestions</h2>
            <p className="text-sm text-slate-400">
              Readers who share similar borrowing tastes and recommendations.
            </p>
          </div>
          <FriendSuggestionList initialSuggestions={initialSuggestions} />
        </div>
      </div>
    </div>
  );
}
