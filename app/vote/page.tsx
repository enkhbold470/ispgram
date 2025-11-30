'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Heart, AlertCircle, RefreshCw, ArrowUpDown } from 'lucide-react'
import { EntryCard } from '@/components/entry-card'
import { useEntries, type Entry } from '@/hooks/use-entries'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { VoteSkeleton } from '@/components/skeletons/vote-skeleton'

export default function LikesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [sortByLikes, setSortByLikes] = useState(false)
  const { entries: fetchedEntries, loading, error, refetch } = useEntries({
    sortBy: sortByLikes ? 'votes' : 'createdAt',
    initialLimit: 100,
  })
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentStudent, setCurrentStudent] = useState<{
    id: string
    studentId: string
    name: string
  } | null>(null)
  const [liking, setLiking] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sync fetched entries to local state
  useEffect(() => {
    setEntries(fetchedEntries)
  }, [fetchedEntries])

  // Sort entries based on the selected mode (only shuffle if not sorting by likes, since API handles that)
  const sortedEntries = useMemo(() => {
    if (entries.length === 0) return []

    if (sortByLikes) {
      // Already sorted by API
      return entries
    } else {
      // Randomize entries for discovery mode
      return entries
    }
  }, [entries, sortByLikes])

  // Refetch when sort mode changes
  useEffect(() => {
    refetch()
  }, [sortByLikes, refetch])

  useEffect(() => {
    if (!isLoaded) return
    if (!user) {
      router.push('/sign-in')
      return
    }

    // Fetch current student
    async function fetchStudent() {
      try {
        const response = await fetch('/api/student')
        if (response.ok) {
          const student = await response.json()
          setCurrentStudent(student)
        }
      } catch (err) {
        console.error('Error fetching student:', err)
      }
    }

    fetchStudent()
  }, [user, isLoaded, router])

  const handleLike = async (entryId: string) => {
    if (liking || !currentStudent) return

    setLiking(true)
    
    // Optimistically update the entry
    const previousEntries = entries
    setEntries((prevEntries) =>
      prevEntries.map((entry) => {
        if (entry.id === entryId) {
          // Check if user already voted
          const hasVoted = entry.votes.some((vote) => vote.studentId === currentStudent.id)
          if (hasVoted) {
            return entry // Already voted, don't update
          }
          
          // Optimistically add vote
          return {
            ...entry,
            voteCount: entry.voteCount + 1,
            votes: [
              ...entry.votes,
              {
                id: `temp-${Date.now()}`,
                studentId: currentStudent.id,
              },
            ],
          }
        }
        return entry
      })
    )

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to like')
      }

      // If sort by likes, we need to re-sort the entries
      if (sortByLikes) {
        // Refetch to get properly sorted entries
        await refetch()
      }
      // Otherwise, optimistic update is sufficient
    } catch (err) {
      // Revert optimistic update on error
      setEntries(previousEntries)
      console.error('Like error:', err)
      alert(err instanceof Error ? err.message : 'Failed to like. Please try again.')
    } finally {
      setLiking(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  if (!isLoaded || loading) {
    return <VoteSkeleton />
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 rounded-lg bg-error-light p-6 text-error">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Error Loading Entries</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-white p-8 shadow-lg text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Entries Yet</h2>
          <p className="text-gray-600">
            Be patient! Entries will appear here once people start sharing their Education Week moments.
          </p>
        </div>
      </div>
    )
  }

  // Allow liking on all entries including own entry
  const entriesToLike = sortedEntries

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Photo Gallery</h1>
        <p className="text-gray-600">
          The contest has ended! Browse all the amazing Education Week moments shared by participants.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-theme-primary-light px-4 py-2 text-sm font-medium text-gray-900">
          <Heart className="h-4 w-4" />
          <span>
            {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'} submitted
          </span>
        </div>

        {/* Controls for sorting and refreshing */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-sm">
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
            <Label htmlFor="sort-mode" className="text-sm font-medium text-gray-700 cursor-pointer">
              Sort by Likes
            </Label>
            <Switch
              id="sort-mode"
              checked={sortByLikes}
              onCheckedChange={setSortByLikes}
            />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {entriesToLike.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow-lg">
          <p className="text-gray-600">
            No entries were submitted during this contest.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entriesToLike.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              currentStudentId={currentStudent?.id || ''}
              onVote={handleLike}
              showVoteButton={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
