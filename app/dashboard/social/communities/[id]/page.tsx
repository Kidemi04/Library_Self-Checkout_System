import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchCommunityDetails, fetchCommunityPosts } from '@/app/lib/supabase/communities';
import { joinCommunity, leaveCommunity } from '@/app/dashboard/social/communities/actions';
import { redirect, notFound } from 'next/navigation';
import { Button } from '@/app/ui/button';
import CreatePostForm from '@/app/ui/dashboard/communities/create-post-form';
import { UserGroupIcon, CalendarIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import GlassCard from '@/app/ui/magic-ui/glass-card';

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
        <main className="w-full max-w-6xl mx-auto space-y-6">
            <BlurFade delay={0.1} yOffset={10}>
                <Link href="/dashboard/social?section=communities" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Communities
                </Link>

                {/* Hero Section */}
                <GlassCard className="relative overflow-hidden p-0 border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                    <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                        {community.coverImageUrl ? (
                            <img
                                src={community.coverImageUrl}
                                alt={community.name}
                                className="h-full w-full object-cover opacity-90"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="px-6 pb-6 md:px-10 md:pb-10">
                        <div className="relative -mt-16 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pt-5">
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="h-32 w-32 rounded-2xl bg-white p-1.5 shadow-xl dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700">
                                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-4xl font-bold text-slate-500 dark:text-slate-300">
                                        {community.name[0].toUpperCase()}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{community.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <UserGroupIcon className="h-4 w-4" />
                                            {community.memberCount} members
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <CalendarIcon className="h-4 w-4" />
                                            Created {new Date(community.createdAt).toLocaleDateString()}
                                        </span>
                                        {community.visibility === 'private' && (
                                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                Private Group
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                {community.isMember ? (
                                    <form action={async () => {
                                        'use server';
                                        await leaveCommunity(community.id);
                                    }}>
                                        <Button type="submit" className="!bg-white !text-slate-700 hover:!bg-red-50 hover:!text-red-600 !border !border-slate-200 shadow-sm hover:shadow transition-all">
                                            Leave Group
                                        </Button>
                                    </form>
                                ) : (
                                    <form action={async () => {
                                        'use server';
                                        await joinCommunity(community.id);
                                    }}>
                                        <Button type="submit" className="!bg-swin-red hover:!bg-swin-red/90 shadow-lg shadow-swin-red/20 transition-all hover:scale-105 active:scale-95">
                                            Join Group
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-lg leading-relaxed">
                            {community.description || 'No description provided.'}
                        </p>
                    </div>
                </GlassCard>
            </BlurFade>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Feed */}
                <div className="space-y-6">
                    {community.isMember && (
                        <BlurFade delay={0.2} yOffset={10}>
                            <CreatePostForm communityId={community.id} />
                        </BlurFade>
                    )}

                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <BlurFade delay={0.3} yOffset={10}>
                                <GlassCard className="flex flex-col items-center justify-center py-12 text-center">
                                    <ChatBubbleLeftIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
                                    <p className="text-slate-500 font-medium">No posts yet</p>
                                    <p className="text-sm text-slate-400">Be the first to share something with the group!</p>
                                </GlassCard>
                            </BlurFade>
                        ) : (
                            posts.map((post, index) => (
                                <BlurFade key={post.id} delay={0.3 + (index * 0.05)} yOffset={10}>
                                    <GlassCard className="p-6 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shadow-inner">
                                                {post.author?.displayName?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {post.author?.displayName || 'Unknown User'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>

                                        {post.title && (
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 dark:text-white tracking-tight">{post.title}</h3>
                                        )}

                                        <div className="prose prose-slate dark:prose-invert max-w-none mb-5 text-slate-600 dark:text-slate-300 leading-relaxed">
                                            <p>{post.body}</p>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-4 dark:border-slate-700/50">
                                            <button className="flex items-center gap-1.5 hover:text-swin-red transition-colors px-2 py-1 rounded-md hover:bg-swin-red/5 -ml-2">
                                                <ChatBubbleLeftIcon className="h-5 w-5" />
                                                <span className="font-medium">{post.commentCount} Comments</span>
                                            </button>
                                        </div>
                                    </GlassCard>
                                </BlurFade>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <BlurFade delay={0.4} yOffset={10}>
                        <GlassCard className="p-6 sticky top-6">
                            <h3 className="font-bold text-slate-900 mb-4 dark:text-white text-lg">About Community</h3>
                            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                    <span className="font-medium text-slate-900 dark:text-slate-200">Visibility</span>
                                    <span className="capitalize bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold">{community.visibility}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                    <span className="font-medium text-slate-900 dark:text-slate-200">Created</span>
                                    <span>{new Date(community.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
                                    <span className="font-medium text-slate-900 dark:text-slate-200">Members</span>
                                    <span>{community.memberCount}</span>
                                </div>

                                {community.tags && community.tags.length > 0 && (
                                    <div className="pt-2">
                                        <p className="font-medium text-slate-900 dark:text-slate-200 mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-2">
                                            {community.tags.map(tag => (
                                                <span key={tag} className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </BlurFade>
                </div>
            </div>
        </main>
    );
}
