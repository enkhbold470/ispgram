'use client'

import { useState } from 'react'
import { Trophy, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { Leaderboard } from '@/components/leaderboard'
import { useEntries } from '@/hooks/use-entries'

export default function ResultsPage() {
  const { entries, loading, error, refetch } = useEntries()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-theme-primary" />
        <p className="text-gray-600">Loading results...</p>
      </div>
    )
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

  const topThree = [...entries]
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 3)

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
                <div
                  key={entry.id}
                  className={`flex flex-col items-center justify-end rounded-lg border-2 bg-white text-center shadow-sm transition-all duration-200 ${borders[olympicIdx]} ${cardClasses[olympicIdx]}`}
                >
                  <div className={`mb-2 ${iconSizes[olympicIdx]}`}>{medals[olympicIdx]}</div>
                  <h3 className={`mb-1 font-bold text-gray-900 ${nameSizes[olympicIdx]}`}>{entry.student.name}</h3>
                  <p className={`font-bold text-gray-900 ${olympicIdx === 1 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>{entry.voteCount}</p>
                  <p className={`text-sm text-gray-600`}>
                    {entry.voteCount === 1 ? 'like' : 'likes'}
                  </p>
                </div>
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
