import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import BlurFade from '@/app/ui/magicUi/blurFade';
import GlassCard from '@/app/ui/magicUi/glassCard';
import type { BorrowingStats } from '@/app/lib/supabase/queries';

const statsConfig = [
  {
    key: 'totalBorrowed' as const,
    label: 'Total Borrowed',
    description: 'All-time returned books',
    icon: BookOpenIcon,
    gradient: 'from-swin-charcoal to-swin-charcoal/90',
    iconBg: 'bg-swin-charcoal/10',
    iconColor: 'text-swin-charcoal dark:text-white',
    format: (v: number) => `${v}`,
  },
  {
    key: 'thisYearCount' as const,
    label: 'This Year',
    description: 'Books borrowed in ' + new Date().getFullYear(),
    icon: CalendarDaysIcon,
    gradient: 'from-swin-red to-swin-red/90',
    iconBg: 'bg-swin-red/10',
    iconColor: 'text-swin-red',
    format: (v: number) => `${v}`,
  },
  {
    key: 'avgLoanDays' as const,
    label: 'Avg. Duration',
    description: 'Average loan period',
    icon: ClockIcon,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    format: (v: number) => (v > 0 ? `${v} days` : '—'),
  },
];

export default function BorrowingHistoryStats({ stats }: { stats: BorrowingStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {statsConfig.map(({ key, label, description, icon: Icon, gradient, iconBg, iconColor, format }, index) => (
        <BlurFade key={key} delay={0.1 + index * 0.1} yOffset={10}>
          <GlassCard
            intensity="medium"
            className="group relative overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`} />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-swin-charcoal dark:text-white">
                  {label}
                </h3>
                <p className="mt-1 text-xs text-swin-charcoal/60 dark:text-slate-300/80">
                  {description}
                </p>
              </div>
              <span className={`rounded-2xl ${iconBg} p-3 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </span>
            </div>
            <p className="relative mt-6 text-4xl font-bold text-swin-charcoal dark:text-white">
              {format(stats[key])}
            </p>
          </GlassCard>
        </BlurFade>
      ))}
    </div>
  );
}
