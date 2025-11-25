import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import BlurFade from '@/app/ui/magic-ui/blur-fade';
import GlassCard from '@/app/ui/magic-ui/glass-card';
import type { DashboardSummary } from '@/app/lib/supabase/types';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const summaryConfig = [
  {
    key: 'totalBooks' as const,
    label: 'Total Items',
    description: 'All catalogue records',
    icon: BookOpenIcon,
    gradient: 'from-swin-charcoal to-swin-charcoal/90',
    iconBg: 'bg-swin-charcoal/10',
    iconColor: 'text-swin-charcoal dark:text-white',
  },
  {
    key: 'availableBooks' as const,
    label: 'Available Now',
    description: 'Copies ready for lending',
    icon: ClipboardDocumentListIcon,
    gradient: 'from-swin-red to-swin-red/90',
    iconBg: 'bg-swin-red/10',
    iconColor: 'text-swin-red',
  },
  {
    key: 'activeLoans' as const,
    label: 'Active Loans',
    description: 'Currently checked out',
    icon: ArrowPathIcon,
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'overdueLoans' as const,
    label: 'Overdue',
    description: 'Follow up required',
    icon: ClockIcon,
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
];

export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryConfig.map(({ key, label, description, icon: Icon, gradient, iconBg, iconColor }, index) => (
        <BlurFade key={key} delay={0.1 + index * 0.1} yOffset={10}>
          <GlassCard
            intensity="medium"
            className="group relative overflow-hidden p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
          >
            {/* Gradient overlay on hover */}
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
              {formatNumber(summary[key])}
            </p>
          </GlassCard>
        </BlurFade>
      ))}
    </div>
  );
}
