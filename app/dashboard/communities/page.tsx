import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchCommunities, fetchMyCommunities } from '@/app/lib/supabase/communities';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import CreateCommunityWrapper from './create-community-wrapper';

export default async function CommunitiesPage(props: {
    searchParams: Promise<{
        tab?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const { user } = await getDashboardSession();
    if (!user) redirect('/login');

    const tab = searchParams?.tab || 'explore'; // 'explore', 'my'

    const allCommunities = tab === 'explore' ? await fetchCommunities() : [];
    const myCommunities = await fetchMyCommunities(user.id);

    const communitiesToShow = tab === 'explore' ? allCommunities : myCommunities;

    return (
        <main className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-swin-charcoal dark:text-white">Communities</h1>
                <CreateCommunityWrapper />
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
                <Link
                    href="/dashboard/communities?tab=explore"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'explore'
                        ? 'border-swin-red text-swin-red'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Explore
                </Link>
                <Link
                    href="/dashboard/communities?tab=my"
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'my'
                        ? 'border-swin-red text-swin-red'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    My Communities
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {communitiesToShow.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <UserGroupIcon />
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No communities found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {tab === 'explore'
                                ? "There are no public communities yet. Be the first to create one!"
                                : "You haven't joined any communities yet."}
                        </p>
                    </div>
                ) : (
                    communitiesToShow.map((community) => (
                        <Link
                            key={community.id}
                            href={`/dashboard/communities/${community.id}`}
                            className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
                        >
                            <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-purple-600 object-cover">
                                {/* Placeholder for cover image if we had one */}
                                {community.coverImageUrl && (
                                    <img
                                        src={community.coverImageUrl}
                                        alt={community.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-swin-red dark:text-white dark:group-hover:text-swin-red transition-colors">
                                    {community.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400 flex-1">
                                    {community.description || 'No description'}
                                </p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                        {community.memberCount || 0} members
                                    </span>
                                    {community.visibility === 'private' && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-800">
                                            Private
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
