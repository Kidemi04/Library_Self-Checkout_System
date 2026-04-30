import KpiCard from '@/app/ui/dashboard/primitives/KpiCard';
import type { BorrowingStats } from '@/app/lib/supabase/queries';

export default function BorrowingHistoryStats({ stats }: { stats: BorrowingStats }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <KpiCard
        label="Total borrowed"
        value={stats.totalBorrowed}
        footer="all-time returns"
      />
      <KpiCard
        label={`This year · ${currentYear}`}
        value={stats.thisYearCount}
        footer="books this year"
      />
      <KpiCard
        label="Avg. duration"
        value={stats.avgLoanDays > 0 ? `${stats.avgLoanDays}d` : '—'}
        footer="average loan period"
      />
    </div>
  );
}
