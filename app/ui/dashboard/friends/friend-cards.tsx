'use client';

import { Avatar } from '@/app/ui/avatar';
import { Button } from '@/app/ui/button';
import type { Friend } from '@/app/lib/supabase/friends';
import { handleFriendRequest } from '@/app/dashboard/friends/actions';

export function FriendCard({ friend }: { friend: Friend }) {
  const displayName = friend.friend?.profile?.displayName ?? friend.friend?.email ?? 'Unknown User';
  const avatarUrl = friend.friend?.profile?.avatarUrl;

  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm rounded-lg">
      <div className="flex items-center space-x-4">
        <Avatar src={avatarUrl} name={displayName} />
        <div>
          <h3 className="text-lg font-medium">{displayName}</h3>
          {friend.status === 'pending' && (
            <p className="text-sm text-gray-500">
              {friend.direction === 'incoming' ? 'Sent you a friend request' : 'Request sent'}
            </p>
          )}
        </div>
      </div>
      {friend.status === 'pending' && friend.direction === 'incoming' && (
        <div className="flex space-x-2">
          <form action={handleFriendRequest}>
            <input type="hidden" name="requestId" value={friend.id} />
            <input type="hidden" name="action" value="accept" />
            <Button type="submit" variant="outline">Accept</Button>
          </form>
          <form action={handleFriendRequest}>
            <input type="hidden" name="requestId" value={friend.id} />
            <input type="hidden" name="action" value="decline" />
            <Button type="submit" variant="outline">Decline</Button>
          </form>
        </div>
      )}
    </div>
  );
}

export function FriendList({ friends }: { friends: Friend[] }) {
  // Group friends by status
  const pending = friends.filter((f) => f.status === 'pending');
  const accepted = friends.filter((f) => f.status === 'accepted');

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Pending Requests</h2>
          <div className="space-y-3">
            {pending.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      )}

      {accepted.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Friends</h2>
          <div className="space-y-3">
            {accepted.map((friend) => (
              <FriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No friends or pending requests found.</p>
      )}
    </div>
  );
}

export function AddFriendButton({ onAdd }: { onAdd: () => void }) {
  return (
    <Button onClick={onAdd} className="w-full justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add Friend
    </Button>
  );
}
