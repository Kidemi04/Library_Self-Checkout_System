import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchFriends, fetchFriendRequests, searchUsers, fetchSuggestedUsers } from '@/app/lib/supabase/friends';
import { redirect } from 'next/navigation';
import { UserPlusIcon, UserMinusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { sendFriendRequest, acceptFriendRequest, removeFriend } from './actions';
import { Button } from '@/app/ui/button';
import Search from '@/app/ui/search';

export default async function FriendsPage(props: {
    searchParams: Promise<{
        query?: string;
        tab?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const { user } = await getDashboardSession();
    if (!user) redirect('/login');

    const query = searchParams?.query || '';
    const tab = searchParams?.tab || 'list'; // 'list', 'requests', 'find'

    const friends = await fetchFriends(user.id);
    const requests = await fetchFriendRequests(user.id);

    let searchResults: any[] = [];
    let isSuggestion = false;

    if (tab === 'find') {
        if (query) {
            searchResults = await searchUsers(query, user.id);
        } else {
            searchResults = await fetchSuggestedUsers(user.id);
            isSuggestion = true;
        }
    }

    return (
        <main className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-swin-charcoal dark:text-white">Friends</h1>
                <div className="flex gap-2">
                    <a
                        href="/dashboard/friends?tab=list"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'list'
                            ? 'bg-swin-red text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                    >
                        My Friends ({friends.length})
                    </a>
                    <a
                        href="/dashboard/friends?tab=requests"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'requests'
                            ? 'bg-swin-red text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                    >
                        Requests ({requests.length})
                    </a>
                    <a
                        href="/dashboard/friends?tab=find"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'find'
                            ? 'bg-swin-red text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                    >
                        Find Friends
                    </a>
                </div>
            </div>

            {tab === 'list' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {friends.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 py-10">
                            You haven't added any friends yet. Try finding some!
                        </p>
                    ) : (
                        friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-swin-red/10 flex items-center justify-center text-swin-red font-bold">
                                        {friend.friendProfile?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {friend.friendProfile?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{friend.friendProfile?.email}</p>
                                    </div>
                                </div>
                                <form action={async () => {
                                    'use server';
                                    await removeFriend(friend.id);
                                }}>
                                    <Button type="submit" className="!bg-gray-100 !text-gray-600 hover:!bg-red-50 hover:!text-red-600 !p-2">
                                        <UserMinusIcon className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'requests' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.length === 0 ? (
                        <p className="col-span-full text-center text-gray-500 py-10">
                            No pending friend requests.
                        </p>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
                                        {request.friendProfile?.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {request.friendProfile?.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500">Wants to be friends</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <form action={async () => {
                                        'use server';
                                        await acceptFriendRequest(request.id);
                                    }}>
                                        <Button type="submit" className="!bg-green-50 !text-green-600 hover:!bg-green-100 !p-2">
                                            <CheckIcon className="h-5 w-5" />
                                        </Button>
                                    </form>
                                    <form action={async () => {
                                        'use server';
                                        await removeFriend(request.id);
                                    }}>
                                        <Button type="submit" className="!bg-red-50 !text-red-600 hover:!bg-red-100 !p-2">
                                            <XMarkIcon className="h-5 w-5" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {tab === 'find' && (
                <div className="space-y-6">
                    <Search placeholder="Search by name or student ID..." />

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {query && searchResults.length === 0 && (
                            <p className="col-span-full text-center text-gray-500 py-10">
                                No users found matching "{query}".
                            </p>
                        )}

                        {!query && searchResults.length > 0 && (
                            <div className="col-span-full mb-2">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Suggested Friends</h3>
                                <p className="text-sm text-gray-500">People you might know</p>
                            </div>
                        )}

                        {searchResults.map((result) => (
                            <div
                                key={result.id}
                                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                        {result.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {result.name || 'Unknown User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{result.bio || 'No bio'}</p>
                                    </div>
                                </div>

                                {result.friendshipStatus === 'accepted' ? (
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        Friends
                                    </span>
                                ) : result.friendshipStatus === 'pending' ? (
                                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                        {result.isSender ? 'Request Sent' : 'Request Received'}
                                    </span>
                                ) : (
                                    <form action={async () => {
                                        'use server';
                                        await sendFriendRequest(result.id);
                                    }}>
                                        <Button type="submit" className="!bg-swin-red !text-white hover:!bg-red-700 !p-2 !px-3 text-xs">
                                            <UserPlusIcon className="h-4 w-4 mr-1" />
                                            Add
                                        </Button>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
