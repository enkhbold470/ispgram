'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2, Heart, AlertCircle, RefreshCw, ArrowUpDown } from 'lucide-react'
import { EntryCard } from '@/components/entry-card'
import { useEntries } from '@/hooks/use-entries'
import { shuffle } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function LikesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { entries, loading, error, refetch } = useEntries()
  const [currentStudent, setCurrentStudent] = useState<{
    id: string
    studentId: string
    name: string
  } | null>(null)
  const [liking, setLiking] = useState(false)
  const [sortByLikes, setSortByLikes] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Sort entries based on the selected mode
  const sortedEntries = useMemo(() => {
    if (entries.length === 0) return []

    if (sortByLikes) {
      // Sort by like count (descending)
      return [...entries].sort((a, b) => b.voteCount - a.voteCount)
    } else {
      // Randomize entries
      return shuffle(entries)
    }
  }, [entries, sortByLikes])

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
    if (liking) return

    setLiking(true)
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

      // Like counts are updated optimistically by VoteButton component
      // No need to refetch here
    } catch (err) {
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
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-sky-600" />
        <p className="text-gray-600">Loading Education Week entries...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-6 text-red-700">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Error Loading Entries</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentStudent) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-white p-8 shadow-lg text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to Liking!</h2>
          <p className="mb-6 text-gray-600">
            To like entries, you&apos;ll need to share your own Education Week highlight first.
          </p>
          <button
            onClick={() => router.push('/submit')}
            className="rounded-full bg-sky-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Share Your Entry
          </button>
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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Cheer on Your Favorites</h1>
        <p className="text-gray-600">
          Tap the heart to celebrate your peers! Send hearts (likes) to as many entries as you like.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-900">
          <Heart className="h-4 w-4" />
          <span>
            {sortedEntries.length} {sortedEntries.length === 1 ? 'entry' : 'entries'} in
            the activity
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
            You&apos;re the only entry so far! Invite your friends to share their Education Week highlights.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entriesToLike.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              currentStudentId={currentStudent.id}
              onVote={handleLike}
              showVoteButton={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
