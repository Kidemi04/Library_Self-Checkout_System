import { getDashboardSession } from '@/app/lib/auth/session';
import DashboardTitleBar from '@/app/ui/dashboard/dashboard-title-bar';

const featureHighlights = [
  {
    title: 'Course-aligned templates',
    description:
      'Start from faculty-approved blueprints for common units, then customize reading lists and activities.',
  },
  {
    title: 'Prerequisite sequencing',
    description:
      'Map modules with dependencies so students unlock materials in the right order and stay on track.',
  },
  {
    title: 'Outcomes & assessment',
    description:
      'Tie each module to learning outcomes, assessment types, and curated library resources.',
  },
  {
    title: 'Progress visibility',
    description:
      'Track cohort completion, flag at-risk students, and surface next actions to instructors.',
  },
  {
    title: 'Collaboration & approvals',
    description:
      'Invite lecturers or librarians to co-edit paths, review updates, and keep an audit history.',
  },
  {
    title: 'Publishing options',
    description:
      'Publish privately to classes, share links externally, or export to LMS/print-friendly formats.',
  },
];

const creationSteps = [
  'Define course scope, duration, and outcomes.',
  'Add modules with required readings and media.',
  'Set prerequisites and milestone checkpoints.',
  'Assign instructors/reviewers for approvals.',
  'Publish to students and monitor progress.',
];

const samplePaths = [
  {
    title: 'CS101: Intro to Programming',
    duration: '6 weeks / 5 modules',
    status: 'Draft',
    outcomes: ['Syntax basics', 'Problem solving', 'First project'],
  },
  {
    title: 'AI201: Foundations of AI',
    duration: '8 weeks / 7 modules',
    status: 'Published',
    outcomes: ['Search & planning', 'ML fundamentals', 'Ethics'],
  },
  {
    title: 'UX220: Human-Centered Design',
    duration: '4 weeks / 4 modules',
    status: 'In review',
    outcomes: ['Research plans', 'Journey maps', 'Usability tests'],
  },
];

const studentPath = {
  title: 'Semester 2 / CS & AI',
  advisor: 'Assigned by Faculty',
  nextMilestone: 'Complete Module 3: Search & Planning',
  progress: 62,
  enrollHref: '/dashboard/learning/paths/enroll',
  modules: [
    { title: 'Module 1: Python foundations', status: 'Done' },
    { title: 'Module 2: Data structures', status: 'Done' },
    { title: 'Module 3: Search & planning', status: 'In progress' },
    { title: 'Module 4: ML fundamentals', status: 'Locked' },
    { title: 'Module 5: Ethics & impact', status: 'Locked' },
  ],
};

export default async function LearningPathsPage() {
  const { user } = await getDashboardSession();
  const role = user?.role ?? 'user';
  const isPrivileged = role === 'staff' || role === 'admin';

  return (
    <main className="space-y-8">
      <DashboardTitleBar
        subtitle="Learning Path Management"
        title="Academic course learning path creation"
        description="Design, publish, and monitor structured learning journeys that align library resources with academic
        curricula. Quickly assemble course-aligned modules, respect prerequisites, and keep faculty and students in
        sync."
      />
        
        <div className="mt-6 flex flex-wrap gap-3">
          {isPrivileged ? (
            <>
              <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-swin-charcoal shadow-md shadow-white/20 transition hover:-translate-y-0.5 hover:shadow-lg">
                Create course path
              </button>
              <button className="rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:shadow-lg">
                Browse templates
              </button>
              <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg">
                Request curation
              </button>
            </>
          ) : (
            <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-swin-charcoal shadow-md shadow-white/20 transition hover:-translate-y-0.5 hover:shadow-lg">
              View my learning path
            </button>
          )}
        </div>

      {isPrivileged ? (
        <>
          <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
            <div className="grid gap-4 md:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-swin-charcoal/10 bg-swin-ivory p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <p className="text-sm font-semibold text-swin-charcoal dark:text-slate-50">{feature.title}</p>
                  <p className="mt-2 text-xs text-swin-charcoal/70 dark:text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div className="rounded-2xl border border-dashed border-swin-charcoal/20 bg-white p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-100">
              <p className="text-sm font-semibold text-swin-charcoal dark:text-slate-50">Create a path in 5 steps</p>
              <ol className="mt-4 space-y-2 text-xs text-swin-charcoal/70 dark:text-slate-300">
                {creationSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-swin-red text-[11px] font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-swin-charcoal to-swin-red text-swin-ivory shadow-lg shadow-swin-red/30 dark:from-slate-800 dark:to-slate-600">
              <div className="p-6">
                <p className="text-sm font-semibold">Need a custom template?</p>
                <p className="mt-2 text-xs text-swin-ivory/80">
                  Submit your syllabus and we will assemble a ready-to-publish path with curated library resources within
                  24 hours.
                </p>
                <button className="mt-4 w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-swin-charcoal shadow-sm transition hover:-translate-y-0.5">
                  Submit syllabus
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-swin-red/80 dark:text-emerald-300/80">
                  Examples
                </p>
                <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-50">Recent learning paths</h2>
                <p className="text-xs text-swin-charcoal/70 dark:text-slate-300">
                  Drafts, in-review, and published paths you can reuse as templates.
                </p>
              </div>
              <button className="rounded-full border border-swin-charcoal/20 px-4 py-2 text-xs font-semibold text-swin-charcoal transition hover:-translate-y-0.5 hover:border-swin-charcoal/40 hover:shadow-sm dark:border-slate-600 dark:text-slate-100">
                View all paths
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {samplePaths.map((path) => (
                <div
                  key={path.title}
                  className="rounded-xl border border-swin-charcoal/10 bg-swin-ivory p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-swin-charcoal dark:text-slate-50">{path.title}</p>
                      <p className="text-[11px] uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-300/80">
                        {path.duration}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-swin-charcoal shadow-sm dark:bg-slate-700 dark:text-slate-100">
                      {path.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-swin-charcoal/70 dark:text-slate-300">
                    {path.outcomes.map((outcome) => (
                      <div key={outcome} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-swin-red" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-full bg-swin-red px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
                      Open
                    </button>
                    <button className="rounded-full border border-swin-charcoal/20 px-3 py-1 text-[11px] font-semibold text-swin-charcoal transition hover:-translate-y-0.5 hover:border-swin-charcoal/40 dark:border-slate-600 dark:text-slate-100">
                      Duplicate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-swin-charcoal/10 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-swin-red/80 dark:text-emerald-300/80">
                My learning path
              </p>
              <h2 className="text-lg font-semibold text-swin-charcoal dark:text-slate-50">Course study planner</h2>
              <p className="text-xs text-swin-charcoal/70 dark:text-slate-300">
                View-only mode. Your assigned path updates as instructors publish new modules.
              </p>
            </div>
            <span className="rounded-full border border-swin-charcoal/20 px-3 py-1 text-[11px] font-semibold text-swin-charcoal dark:border-slate-600 dark:text-slate-100">
              Progress {studentPath.progress}%
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-swin-charcoal/10 bg-swin-ivory p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-swin-charcoal dark:text-slate-50">{studentPath.title}</p>
                <p className="text-[11px] uppercase tracking-wide text-swin-charcoal/60 dark:text-slate-300/80">
                  {studentPath.advisor}
                </p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-swin-charcoal shadow-sm dark:bg-slate-700 dark:text-slate-100">
                Next: {studentPath.nextMilestone}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {studentPath.modules.map((module) => (
                <div
                  key={module.title}
                  className="flex items-center justify-between rounded-lg border border-swin-charcoal/10 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-swin-red" />
                    <span>{module.title}</span>
                  </div>
                  <span
                    className={
                      module.status === 'Done'
                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100'
                        : module.status === 'In progress'
                          ? 'rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-100'
                          : 'rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    }
                  >
                    {module.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-swin-charcoal/20 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-swin-red/80 dark:text-emerald-300/80">Action required</p>
                <p className="text-sm font-semibold text-swin-charcoal dark:text-slate-50">Enroll to start your next module</p>
                <p className="text-xs text-swin-charcoal/70 dark:text-slate-300">
                  Tap enroll to unlock the next module in your path. Instructors will see your progress once started.
                </p>
              </div>
              <a
                href={studentPath.enrollHref}
                className="rounded-full bg-swin-red px-4 py-2 text-xs font-semibold text-white shadow-md shadow-swin-red/30 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Enroll now
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
