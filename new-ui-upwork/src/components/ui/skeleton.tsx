import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Job Card Skeleton
export function JobCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3 min-w-[280px] max-w-[320px] flex-shrink-0 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div>
          <Skeleton className="h-3 w-12 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div>
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </td>
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-12" />
                  </th>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="text-left p-4 font-medium">
                    <Skeleton className="h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Cards Skeleton
export function MobileCardsSkeleton() {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 p-4 pb-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
}

export { Skeleton }
