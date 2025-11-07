import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getFriends, getFriendSuggestions } from '@/app/lib/supabase/friend-queries';
import { getDashboardSession } from '@/app/lib/auth/session';
import FriendsClient from './friends-client';

export default async function FriendsPage() {
  const { user } = await getDashboardSession();
  if (!user) {
    redirect('/login?callbackUrl=/dashboard/friends');
  }

  const [friends, suggestions] = await Promise.all([
    getFriends(user.id),
    getFriendSuggestions(user.id, 5),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 sm:px-8">
      <Suspense fallback={<div className="text-center text-slate-500">Loading friends...</div>}>
        <FriendsClient initialFriends={friends} initialSuggestions={suggestions} />
      </Suspense>
    </div>
  );
}
