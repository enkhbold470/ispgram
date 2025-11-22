'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react'
import { Leaderboard } from '@/components/leaderboard'
import { useEntries } from '@/hooks/use-entries'
import { ResultsSkeleton } from '@/components/skeletons/results-skeleton'

export default function ResultsPage() {
  // Fetch ALL entries sorted by votes for accurate leaderboard
  const { entries, loading, error, refetch, hasMore } = useEntries({
    sortBy: 'votes',
    initialLimit: 1000, // Fetch a large number to get all entries
  })
  const [refreshing, setRefreshing] = useState(false)

  // Sort entries by votes (API should already sort, but ensure client-side sort is correct)
  const sortedEntries = [...entries].sort((a, b) => {
    const diff = b.voteCount - a.voteCount
    // If votes are equal, use createdAt as tiebreaker (newer first)
    if (diff === 0) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return diff
  })
  
  const topThree = sortedEntries.slice(0, 3)

  // Debug logging - ALL useEffect hooks must be before early returns
  useEffect(() => {
    if (entries.length > 0) {
      console.group('🔍 RESULTS PAGE DEBUG')
      console.log('📊 Total entries fetched:', entries.length)
      console.log('📋 All entries with vote counts:', entries.map(e => ({
        id: e.id,
        name: e.student.name,
        voteCount: e.voteCount,
        createdAt: e.createdAt
      })))
      
      const sortedByVotes = [...entries].sort((a, b) => b.voteCount - a.voteCount)
      console.log('🏆 Top 10 by votes:', sortedByVotes.slice(0, 10).map((e, idx) => ({
        rank: idx + 1,
        id: e.id,
        name: e.student.name,
        voteCount: e.voteCount
      })))
      
      const topThreeDebug = sortedByVotes.slice(0, 3)
      console.log('🥇 Top 3 entries:', topThreeDebug.map((e, idx) => ({
        rank: idx + 1,
        id: e.id,
        name: e.student.name,
        voteCount: e.voteCount
      })))
      
      // Check for entries with high votes that might be missing
      const highVoteEntries = entries.filter(e => e.voteCount > 0)
      console.log('📈 Entries with votes:', highVoteEntries.length)
      console.log('📊 Vote distribution:', {
        total: entries.length,
        withVotes: highVoteEntries.length,
        zeroVotes: entries.filter(e => e.voteCount === 0).length,
        maxVotes: Math.max(...entries.map(e => e.voteCount), 0),
        minVotes: Math.min(...entries.map(e => e.voteCount), 0),
      })
      
      console.log('🔄 Has more entries to load:', hasMore)
      console.groupEnd()
    }
  }, [entries, hasMore])

  // Debug: Log what we're displaying
  useEffect(() => {
    if (topThree.length > 0) {
      console.group('🎯 DISPLAYING TOP 3')
      topThree.forEach((entry, idx) => {
        console.log(`Rank ${idx + 1}:`, {
          name: entry.student.name,
          votes: entry.voteCount,
          id: entry.id,
          createdAt: entry.createdAt
        })
      })
      console.groupEnd()
    }
  }, [topThree])

  const handleRefresh = async () => {
    setRefreshing(true)
    console.log('🔄 Refreshing entries...')
    await refetch()
    setRefreshing(false)
    console.log('✅ Refresh complete')
  }

  if (loading) {
    return <ResultsSkeleton />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 rounded-lg bg-error-light p-6 text-error">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Error Loading Results</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Arrange for olympic order: [3rd, 1st, 2nd]
  const displayTopThree =
    topThree.length === 3
      ? [topThree[2], topThree[0], topThree[1]]
      : topThree.length === 2
      ? [null, topThree[0], topThree[1]]
      : topThree.length === 1
      ? [null, topThree[0], null]
      : [null, null, null]

  // Medal icons and border colors for [3rd, 1st, 2nd]
  const medals = ['🥉', '🥇', '🥈']
  const borders = ['border-[var(--rank-bronze)]', 'border-[var(--rank-gold)]', 'border-[var(--rank-silver)]']
  // Extra: Different box/sizing for 1st (middle) place
  const cardClasses = [
    // 3rd place: slightly smaller
    '!h-48 md:!h-60 !py-3 !px-2 md:!py-4 md:!px-2 scale-90',
    // 1st place: largest, emphasized
    '!h-56 md:!h-72 !py-4 !px-3 md:!py-8 md:!px-6 scale-105 z-10',
    // 2nd place: larger than 3rd but smaller than 1st
    '!h-52 md:!h-64 !py-3.5 !px-2 md:!py-6 md:!px-4 scale-95',
  ]
  const iconSizes = [
    'text-3xl md:text-5xl',
    'text-5xl md:text-7xl',
    'text-4xl md:text-6xl',
  ]
  const nameSizes = [
    'text-lg md:text-xl',
    'text-xl md:text-2xl',
    'text-lg md:text-xl',
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Trophy className="h-16 w-16 text-theme-accent" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Activity Leaderboard</h1>
        <p className="text-gray-600">
          Live rankings of every Education Week entry. Let&apos;s celebrate the most engaging highlights!
        </p>
      </div>

      {entries.length > 0 && topThree.length > 0 && (
        <div className="mb-8 rounded-lg border bg-linear-to-r from-sky-50 to-indigo-50 p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">🎉 Top 3 🎉</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            {displayTopThree.map((entry, olympicIdx) => {
              if (!entry) {
                // Show blanks for missing (less than 3 participants)
                return (
                  <div
                    key={`empty-${olympicIdx}`}
                    className={`rounded-lg border-2 bg-gray-50 text-center shadow-sm opacity-40 ${borders[olympicIdx]} ${cardClasses[olympicIdx]}`}
                  ></div>
                )
              }
              return (
                <Link
                  key={entry.id}
                  href={`/post/${entry.id}`}
                  className={`flex flex-col items-center justify-end rounded-lg border-2 bg-white text-center shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${borders[olympicIdx]} ${cardClasses[olympicIdx]}`}
                >
                  <div className={`mb-2 ${iconSizes[olympicIdx]}`}>{medals[olympicIdx]}</div>
                  <h3 className={`mb-1 font-bold text-gray-900 ${nameSizes[olympicIdx]}`}>{entry.student.name}</h3>
                  <p className={`font-bold text-gray-900 ${olympicIdx === 1 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{entry.voteCount}</p>
                  <p className={`text-sm text-gray-600`}>
                    {entry.voteCount === 1 ? 'like' : 'likes'}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Full Rankings</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <Leaderboard entries={entries} />

      {entries.length > 0 && (
        <div className="mt-8 rounded-lg border bg-theme-primary-light p-6 text-center">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Invite classmates to join the activity and cheer on your entry!
          </p>
        </div>
      )}
    </div>
  )
}
