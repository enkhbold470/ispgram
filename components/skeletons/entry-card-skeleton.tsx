import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function EntryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </Card>
  )
}

