import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      {/* Top 3 Section */}
      <div className="mb-8 rounded-lg border bg-linear-to-r from-sky-50 to-indigo-50 p-6 shadow-lg">
        <Skeleton className="h-7 w-32 mx-auto mb-4" />
        <div className="grid grid-cols-3 gap-4 items-end">
          <Skeleton className="h-48 md:h-60 rounded-lg" />
          <Skeleton className="h-56 md:h-72 rounded-lg" />
          <Skeleton className="h-52 md:h-64 rounded-lg" />
        </div>
      </div>

      {/* Full Rankings Header */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>

      {/* Leaderboard Items */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

