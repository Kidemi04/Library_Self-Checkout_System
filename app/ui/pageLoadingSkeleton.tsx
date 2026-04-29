// Shared shimmer animation class
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-canvas/60 dark:before:via-on-dark/10 before:to-transparent';

function SkeletonLine({ width = 'w-full', height = 'h-4' }: { width?: string; height?: string }) {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-md bg-surface-cream-strong dark:bg-dark-surface-strong ${height} ${width}`} />
  );
}

function SkeletonCard() {
  return (
    <div className={`${shimmer} relative overflow-hidden rounded-card bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline p-5 flex flex-col gap-3`}>
      <SkeletonLine width="w-1/3" height="h-3" />
      <SkeletonLine width="w-full" height="h-8" />
      <SkeletonLine width="w-1/2" height="h-3" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-hairline dark:border-dark-hairline">
      <div className={`${shimmer} relative overflow-hidden rounded-full bg-surface-cream-strong dark:bg-dark-surface-strong h-10 w-10 shrink-0`} />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonLine width="w-2/5" height="h-4" />
        <SkeletonLine width="w-1/4" height="h-3" />
      </div>
      <SkeletonLine width="w-16" height="h-4" />
    </div>
  );
}

export default function PageLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6">
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-48" height="h-7" />
        <SkeletonLine width="w-24" height="h-9" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Content rows */}
      <div className={`${shimmer} relative overflow-hidden rounded-card bg-surface-card dark:bg-dark-surface-card border border-hairline dark:border-dark-hairline p-4`}>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}
