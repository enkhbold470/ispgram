import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export function SubmitSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Skeleton className="h-9 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
      </div>

      <Card className="p-6 space-y-6">
        {/* Student ID Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Photo Upload Area */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" />
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 text-center">
                <Skeleton className="h-5 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>

        {/* Submit Button */}
        <Skeleton className="h-12 w-full rounded-full" />
      </Card>
    </div>
  )
}

