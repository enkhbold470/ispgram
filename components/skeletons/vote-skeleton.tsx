import { Skeleton } from '@/components/ui/skeleton'
import { EntryCardSkeleton } from './entry-card-skeleton'

export function VoteSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton className="h-9 w-80 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto mb-4" />
        <Skeleton className="h-8 w-48 mx-auto rounded-full" />

        {/* Controls */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </div>

      {/* Entry Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <EntryCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

