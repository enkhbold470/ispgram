'use client'

import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2, Heart, AlertCircle } from 'lucide-react'
import { EntryCard } from '@/components/entry-card'
import { useEntries } from '@/hooks/use-entries'
import { shuffle } from '@/lib/utils'

export default function VotePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { entries, loading, error, refetch } = useEntries()
  const [currentStudent, setCurrentStudent] = useState<{
    id: string
    studentId: string
    name: string
  } | null>(null)
  const [voting, setVoting] = useState(false)

  // Randomize entries once on mount
  const randomizedEntries = useMemo(() => {
    if (entries.length === 0) return []
    return shuffle(entries)
  }, [entries])

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

  const handleVote = async (entryId: string) => {
    if (voting) return

    setVoting(true)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vote')
      }

      // Refetch entries to update vote counts
      await refetch()
    } catch (err) {
      console.error('Vote error:', err)
      alert(err instanceof Error ? err.message : 'Failed to vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="text-gray-600">Loading costumes...</p>
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
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to Voting!</h2>
          <p className="mb-6 text-gray-600">
            To vote, you need to submit your own costume entry first.
          </p>
          <button
            onClick={() => router.push('/submit')}
            className="rounded-full bg-orange-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Submit Your Costume
          </button>
        </div>
      </div>
    )
  }

  if (randomizedEntries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-white p-8 shadow-lg text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Entries Yet</h2>
          <p className="text-gray-600">
            Be patient! Entries will appear here once people start submitting their costumes.
          </p>
        </div>
      </div>
    )
  }

  // Filter out current user's entry
  const entriesToVote = randomizedEntries.filter(
    (entry) => entry.studentId !== currentStudent.id
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Vote for Your Favorites</h1>
        <p className="text-gray-600">
          Click the heart to vote! You can vote for as many costumes as you like.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-900">
          <Heart className="h-4 w-4" />
          <span>
            {randomizedEntries.length} {randomizedEntries.length === 1 ? 'entry' : 'entries'} in
            the contest
          </span>
        </div>
      </div>

      {entriesToVote.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center shadow-lg">
          <p className="text-gray-600">
            You&apos;re the only entry so far! Invite your friends to submit their costumes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entriesToVote.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              currentStudentId={currentStudent.id}
              onVote={handleVote}
              showVoteButton={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}

