import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchFriends, fetchFriendRequests, searchUsers, fetchSuggestedUsers } from '@/app/lib/supabase/friends';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserPlusIcon, UserMinusIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { sendFriendRequest, acceptFriendRequest, removeFriend } from './actions';
import { Button } from '@/app/ui/button';
import Search from '@/app/ui/search';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import GlassCard from '@/app/ui/magic-ui/glass-card';
import clsx from 'clsx';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';

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

    const tabClass = (isActive: boolean) => clsx(
        'flex-1 px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-300 text-center relative z-10',
        isActive
            ? 'text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
    );

    const activeTabBgStyle = {
        list: '0%',
        requests: '33.33%',
        find: '66.66%'
    };

    return (
        <main className="w-full space-y-8">
            <DashboardTitleBar
                subtitle="Social"
                title="Friends"
                description="Manage your connections and find new people."
            />

            <BlurFade delay={0.2} yOffset={10}>
                <div className="relative bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full backdrop-blur-md flex w-full max-w-md mx-auto md:mx-0">
                    <div
                        className="absolute top-1 bottom-1 left-1 w-[calc(33.33%-0.5rem)] bg-white dark:bg-slate-700 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]"
                        style={{ transform: `translateX(${tab === 'requests' ? '100%' : tab === 'find' ? '200%' : '0%'})` }}
                    />
                    <Link href="/dashboard/friends?tab=list" className={tabClass(tab === 'list')}>
                        My Friends ({friends.length})
                    </Link>
                    <Link href="/dashboard/friends?tab=requests" className={tabClass(tab === 'requests')}>
                        Requests ({requests.length})
                    </Link>
                    <Link href="/dashboard/friends?tab=find" className={tabClass(tab === 'find')}>
                        Find Friends
                    </Link>
                </div>
            </BlurFade>

            <BlurFade delay={0.3} yOffset={20}>
                {tab === 'list' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {friends.length === 0 ? (
                            <GlassCard className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <UserPlusIcon className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No friends yet</h3>
                                <p className="text-slate-500 max-w-xs mx-auto mt-1">
                                    Start building your network by finding people you know.
                                </p>
                                <Link href="/dashboard/friends?tab=find" className="mt-6 px-6 py-2 bg-swin-red text-white rounded-full font-medium hover:bg-swin-red/90 transition-colors shadow-lg shadow-swin-red/20">
                                    Find Friends
                                </Link>
                            </GlassCard>
                        ) : (
                            friends.map((friend) => (
                                <GlassCard
                                    key={friend.id}
                                    className="flex items-center justify-between p-5 group hover:scale-[1.02] transition-transform duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-swin-red to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {friend.friendProfile?.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {friend.friendProfile?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{friend.friendProfile?.email}</p>
                                        </div>
                                    </div>
                                    <form action={async () => {
                                        'use server';
                                        await removeFriend(friend.id);
                                    }}>
                                        <button
                                            type="submit"
                                            className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                                            title="Remove friend"
                                        >
                                            <UserMinusIcon className="h-5 w-5" />
                                        </button>
                                    </form>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}

                {tab === 'requests' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {requests.length === 0 ? (
                            <GlassCard className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <CheckIcon className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500">No pending friend requests.</p>
                            </GlassCard>
                        ) : (
                            requests.map((request) => (
                                <GlassCard
                                    key={request.id}
                                    className="flex flex-col p-5 gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-lg">
                                            {request.friendProfile?.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {request.friendProfile?.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Wants to be friends</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <form action={async () => {
                                            'use server';
                                            await acceptFriendRequest(request.id);
                                        }} className="flex-1">
                                            <button type="submit" className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                                                <CheckIcon className="h-4 w-4" />
                                                Accept
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            'use server';
                                            await removeFriend(request.id);
                                        }} className="flex-1">
                                            <button type="submit" className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                                <XMarkIcon className="h-4 w-4" />
                                                Decline
                                            </button>
                                        </form>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                )}

                {tab === 'find' && (
                    <div className="space-y-6">
                        <div className="relative max-w-md">
                            <Search placeholder="Search by name or student ID..." />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {query && searchResults.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500">
                                    No users found matching "{query}".
                                </div>
                            )}

                            {!query && searchResults.length > 0 && (
                                <div className="col-span-full mb-2">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <UserPlusIcon className="h-5 w-5 text-swin-red" />
                                        Suggested Friends
                                    </h3>
                                    <p className="text-sm text-slate-500">People you might know</p>
                                </div>
                            )}

                            {searchResults.map((result) => (
                                <GlassCard
                                    key={result.id}
                                    className="flex items-center justify-between p-5 group hover:scale-[1.02] transition-transform duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg">
                                            {result.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                {result.name || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{result.bio || 'No bio'}</p>
                                        </div>
                                    </div>

                                    {result.friendshipStatus === 'accepted' ? (
                                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1 rounded-full ring-1 ring-emerald-100 dark:ring-emerald-800">
                                            Friends
                                        </span>
                                    ) : result.friendshipStatus === 'pending' ? (
                                        <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-3 py-1 rounded-full ring-1 ring-amber-100 dark:ring-amber-800">
                                            {result.isSender ? 'Sent' : 'Received'}
                                        </span>
                                    ) : (
                                        <form action={async () => {
                                            'use server';
                                            await sendFriendRequest(result.id);
                                        }}>
                                            <button type="submit" className="p-2 rounded-full bg-swin-red text-white hover:bg-swin-red/90 shadow-md shadow-swin-red/20 transition-all hover:scale-110 active:scale-95">
                                                <UserPlusIcon className="h-5 w-5" />
                                            </button>
                                        </form>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}
            </BlurFade>
        </main>
    );
}
