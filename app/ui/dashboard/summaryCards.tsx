import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import BlurFade from '@/app/ui/magicUi/blurFade';
import type { DashboardSummary } from '@/app/lib/supabase/types';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const summaryConfig = [
  {
    key: 'totalBooks' as const,
    label: 'Total Items',
    description: 'All catalogue records',
    icon: BookOpenIcon,
    iconBg: 'bg-surface-cream-strong text-body dark:bg-dark-surface-strong dark:text-on-dark/80',
  },
  {
    key: 'availableBooks' as const,
    label: 'Available Now',
    description: 'Copies ready for lending',
    icon: ClipboardDocumentListIcon,
    iconBg: 'bg-success/15 text-success dark:bg-success/20',
  },
  {
    key: 'activeLoans' as const,
    label: 'Active Loans',
    description: 'Currently checked out',
    icon: ArrowPathIcon,
    iconBg: 'bg-accent-teal/15 text-accent-teal dark:bg-accent-teal/20',
  },
  {
    key: 'overdueLoans' as const,
    label: 'Overdue',
    description: 'Follow up required',
    icon: ClockIcon,
    iconBg: 'bg-primary/10 text-primary dark:bg-dark-primary/15 dark:text-dark-primary',
  },
];

export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryConfig.map(({ key, label, description, icon: Icon, iconBg }, index) => (
        <BlurFade key={key} delay={0.1 + index * 0.1} yOffset={10}>
          <div className="rounded-card border border-hairline bg-surface-card p-6 transition-colors hover:border-primary/20 dark:border-dark-hairline dark:bg-dark-surface-card dark:hover:border-dark-primary/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-sans text-caption-uppercase text-muted dark:text-on-dark-soft">
                  {label}
                </h3>
                <p className="mt-1 font-sans text-body-sm text-muted dark:text-on-dark-soft">
                  {description}
                </p>
              </div>
              <span className={`rounded-card p-3 ${iconBg}`}>
                <Icon className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-6 font-display text-display-sm text-ink dark:text-on-dark">
              {formatNumber(summary[key])}
            </p>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}
