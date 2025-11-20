import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchCommunityDetails, fetchCommunityPosts } from '@/app/lib/supabase/communities';
import { joinCommunity, leaveCommunity } from '@/app/dashboard/communities/actions';
import { redirect, notFound } from 'next/navigation';
import { Button } from '@/app/ui/button';
import CreatePostForm from '@/app/ui/dashboard/communities/create-post-form';
import { UserGroupIcon, CalendarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default async function CommunityPage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const { user } = await getDashboardSession();
    if (!user) redirect('/login');

    const community = await fetchCommunityDetails(params.id, user.id);
    if (!community) notFound();

    const posts = await fetchCommunityPosts(params.id);

    return (
        <main className="w-full max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                    {community.coverImageUrl && (
                        <img
                            src={community.coverImageUrl}
                            alt={community.name}
                            className="h-full w-full object-cover opacity-80"
                        />
                    )}
                </div>
                <div className="px-6 pb-6">
                    <div className="relative -mt-12 mb-4 flex items-end justify-between">
                        <div className="flex items-end gap-4">
                            <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-md dark:bg-gray-800">
                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-2xl font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                    {community.name[0].toUpperCase()}
                                </div>
                            </div>
                            <div className="mb-1">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{community.name}</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <UserGroupIcon className="h-4 w-4" />
                                        {community.memberCount} members
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        Created {new Date(community.createdAt).toLocaleDateString()}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="mb-1">
                            {community.isMember ? (
                                <form action={async () => {
                                    'use server';
                                    await leaveCommunity(community.id);
                                }}>
                                    <Button type="submit" className="!bg-gray-100 !text-gray-700 hover:!bg-red-50 hover:!text-red-600 border border-gray-200">
                                        Leave Group
                                    </Button>
                                </form>
                            ) : (
                                <form action={async () => {
                                    'use server';
                                    await joinCommunity(community.id);
                                }}>
                                    <Button type="submit">Join Group</Button>
                                </form>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
                        {community.description || 'No description provided.'}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Feed */}
                <div className="space-y-6">
                    {community.isMember && (
                        <CreatePostForm communityId={community.id} />
                    )}

                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                            {post.author?.displayName?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {post.author?.displayName || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {post.title && (
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-white">{post.title}</h3>
                                    )}

                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 mb-4">
                                        <p>{post.body}</p>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3 dark:border-gray-700">
                                        <button className="flex items-center gap-1 hover:text-swin-red transition-colors">
                                            <ChatBubbleLeftIcon className="h-4 w-4" />
                                            {post.commentCount} Comments
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 mb-3 dark:text-white">About</h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                <span className="font-medium text-gray-900 dark:text-gray-200">Visibility: </span>
                                <span className="capitalize">{community.visibility}</span>
                            </p>
                            {community.tags && community.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {community.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
