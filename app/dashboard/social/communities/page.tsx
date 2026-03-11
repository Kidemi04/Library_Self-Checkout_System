import { Suspense } from 'react';
import { getDashboardSession } from '@/app/lib/auth/session';
import { fetchCommunities, fetchMyCommunities } from '@/app/lib/supabase/communities';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import BlurFade from '@/app/ui/magicUi/blurFade';
import GlassCard from '@/app/ui/magicUi/glassCard';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import clsx from 'clsx';
import TabSwitch from '@/app/ui/dashboard/tabSwitch';


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

	const tabs = [
		{ label: 'Explore', value: 'explore', href: 'communities?tab=explore' },
		{ label: 'My Communities', value: 'my', href: 'communities?tab=my' },
	];
    return (
        <main className="w-full space-y-8">
					<DashboardTitleBar
						subtitle="Social"
						title="Communities"
						description="Join groups and connect with people who share your interests."
					/>

					<TabSwitch tabs={tabs} activeTab={tab} className="max-w-xs" />

					<BlurFade delay={0.3} yOffset={20}>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{communitiesToShow.length === 0 ? (
								<GlassCard className="col-span-full flex flex-col items-center justify-center py-16 text-center">
									<div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
										<UserGroupIcon className="h-8 w-8 text-slate-400" />
											</div>
										<h3 className="text-lg font-semibold text-slate-900 dark:text-white">No communities found</h3>
										<p className="text-slate-500 max-w-xs mx-auto mt-1">
											{tab === 'explore'
												? "There are no public communities yet. Be the first to create one!"
												: "You haven't joined any communities yet."}
										</p>
									</GlassCard>
								) : (
                        communitiesToShow.map((community) => (
                            <Link
                                key={community.id}
                                href={`/dashboard/social/communities/${community.id}`}
                                className="block group"
                            >
                                <GlassCard className="h-full overflow-hidden p-0 hover:scale-[1.02] transition-transform duration-300 border-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                    <div className="h-32 w-full bg-gradient-to-br from-blue-500 to-purple-600 relative">
                                        {community.coverImageUrl ? (
                                            <img
                                                src={community.coverImageUrl}
                                                alt={community.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                                <UserGroupIcon className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-5 flex flex-col h-[calc(100%-8rem)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-swin-red transition-colors line-clamp-1">
                                                {community.name}
                                            </h3>
                                            {community.visibility === 'private' && (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                    Private
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                                            {community.description || 'No description'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                            <UserGroupIcon className="h-4 w-4" />
                                            <span>{community.memberCount || 0} members</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))
                    )}
                </div>
            </BlurFade>
        </main>
    );
}
