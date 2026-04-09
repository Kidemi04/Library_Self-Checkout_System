import { fetchLearningPaths } from '@/app/lib/learning/paths';
import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboardTitleBar';
import Link from 'next/link';
import { fetchUserContext } from '@/app/lib/recommendations/user-context';
import PersonalPathGenerator from '@/app/ui/dashboard/learning/personalPathGenerator';

export default async function StudentPathsPage() {
  const { user } = await getDashboardSession();
  
  const context = user?.id ? await fetchUserContext(user.id) : { historyTags: [], savedInterests: [] };
  const personalizedTopic = context.historyTags[0] || context.savedInterests[0] || 'General Studies';
  
  // Natively pre-fill with paths matching the bachelor requirements, or just load global 
  const paths = await fetchLearningPaths(); 

  return (
    <main className="space-y-8">
      <DashboardTitleBar 
        title="Learning Paths" 
        subtitle="Your Curriculum" 
        description="Follow a structured sequence of books and LinkedIn courses designed to take you from Beginner to Advanced." 
      />

      {/* Auto-Path Builder mapped to user interests */}
      <PersonalPathGenerator defaultTopic={personalizedTopic} />

      {paths.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center text-swin-charcoal/60 dark:text-slate-400">
          Oops, the school administration has not created any structured learning curriculums for your degree yet.
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map(path => (
            <div key={path.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E14327] bg-[#E14327]/10 px-2 py-1 rounded">
                  {path.targetBachelor || 'General Knowledge'}
                </span>
                <h3 className="text-xl font-bold mt-4 dark:text-white">{path.title}</h3>
                <p className="text-sm text-swin-charcoal/70 dark:text-slate-300 mt-2 line-clamp-2">
                  {path.description || 'Complete this multi-step syllabus leveraging the best books in the Swinburne library and professional courses from LinkedIn.'}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-swin-charcoal/80 dark:text-slate-400">Curriculum Structure:</p>
                {path.steps?.map((step: any) => (
                  <div key={step.id} className="flex gap-3 items-center text-sm">
                    <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                      {step.stepOrder}
                    </div>
                    <span className="dark:text-slate-200 font-medium truncate flex-1">
                      {step.difficulty ? `[${step.difficulty}] ` : ''}{step.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                      {step.resourceType}
                    </span>
                  </div>
                ))}
              </div>
              
              <Link href="#" className="w-full mt-6 bg-swin-charcoal text-white dark:bg-white dark:text-swin-charcoal flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold hover:opacity-90">
                Enroll in Path
              </Link>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
