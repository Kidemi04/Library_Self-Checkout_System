import { getFriends } from '@/app/lib/supabase/friend-queries';
import { Friend } from '@/app/lib/supabase/friends';
import { Avatar } from '@/app/ui/avatar';
import { Button } from '@/app/ui/button';
import { handleFriendRequest } from '@/app/dashboard/friends/actions';
import { getDashboardSession } from '@/app/lib/auth/session';

export async function FriendRequestList() {
  const { user } = await getDashboardSession();
  if (!user) {
    return (
      <p className="text-sm text-gray-500">
        Sign in to view friend requests.
      </p>
    );
  }

  const requests = await getFriends(user.id, 'pending');

  const incoming = requests.filter((request) => request.direction === 'incoming');

  if (!incoming.length) {
    return (
      <p className="text-sm text-gray-500">
        No pending friend requests.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {incoming.map((request) => (
        <FriendRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}

function FriendRequestCard({ request }: { request: Friend }) {
  const isPending = request.status === 'pending';

  return (
    <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
      <div className="flex items-center space-x-4">
        <Avatar
          src={request.friend?.profile?.avatarUrl}
          name={request.friend?.profile?.displayName || undefined}
          fallback={request.friend?.email?.[0] || '?'}
        />
        <div>
          <p className="font-medium">
            {request.friend?.profile?.displayName || request.friend?.email}
          </p>
          <p className="text-sm text-gray-500">
            Wants to be your friend
          </p>
        </div>
      </div>
      {isPending && (
        <form className="flex gap-2" action={handleFriendRequest}>
          <input type="hidden" name="requestId" value={request.id} />
          <Button
            type="submit"
            name="action"
            value="decline"
            variant="outline"
          >
            Decline
          </Button>
          <Button
            type="submit"
            name="action"
            value="accept"
          >
            Accept
          </Button>
        </form>
      )}
    </div>
  );
}
