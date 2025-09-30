import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { DashboardSummary } from '@/app/lib/supabase/types';

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

const summaryConfig = [
  {
    key: 'totalBooks' as const,
    label: 'Total Items',
    description: 'All catalogue records',
    icon: BookOpenIcon,
    accent: 'bg-swin-charcoal text-swin-ivory',
    descriptionClass: 'text-swin-ivory/70',
  },
  {
    key: 'availableBooks' as const,
    label: 'Available Now',
    description: 'Copies ready for lending',
    icon: ClipboardDocumentListIcon,
    accent: 'bg-swin-red text-swin-ivory',
    descriptionClass: 'text-swin-ivory/70',
  },
  {
    key: 'activeLoans' as const,
    label: 'Active Loans',
    description: 'Currently checked out',
    icon: ArrowPathIcon,
    accent: 'bg-swin-ivory text-swin-charcoal border border-swin-charcoal/20',
    descriptionClass: 'text-swin-charcoal/60',
  },
  {
    key: 'overdueLoans' as const,
    label: 'Overdue',
    description: 'Follow up required',
    icon: ClockIcon,
    accent: 'bg-swin-ivory text-swin-red border border-swin-red/30',
    descriptionClass: 'text-swin-red/70',
  },
];

export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {summaryConfig.map(({ key, label, description, icon: Icon, accent, descriptionClass }) => (
        <article
          key={key}
          className={`flex flex-col justify-between rounded-2xl p-5 shadow-md shadow-swin-charcoal/10 ${accent}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide">{label}</h3>
              <p className={`mt-1 text-xs ${descriptionClass}`}>
                {description}
              </p>
            </div>
            <span className="rounded-full bg-black/10 p-2">
              <Icon className="h-6 w-6" />
            </span>
          </div>
          <p className="mt-6 text-3xl font-bold">{formatNumber(summary[key])}</p>
        </article>
      ))}
    </div>
  );
}
