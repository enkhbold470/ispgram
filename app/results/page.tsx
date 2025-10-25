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
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="text-gray-600">Loading results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-6 text-red-700">
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Trophy className="h-16 w-16 text-yellow-600" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Contest Leaderboard</h1>
        <p className="text-gray-600">
          Live rankings of all costume entries. May the best costume win!
        </p>
      </div>

      {entries.length > 0 && topThree.length > 0 && (
        <div className="mb-8 rounded-lg border bg-linear-to-r from-yellow-50 to-orange-50 p-6 shadow-lg">
          <h2 className="mb-4 text-center text-xl font-bold text-gray-900">🎉 Top 3 🎉</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topThree.map((entry, index) => {
              const rank = index + 1
              const medals = ['🥇', '🥈', '🥉']

              return (
                <div
                  key={entry.id}
                  className={`rounded-lg border-2 bg-white p-4 text-center shadow-sm ${
                    rank === 1
                      ? 'border-yellow-400'
                      : rank === 2
                      ? 'border-gray-400'
                      : 'border-orange-400'
                  }`}
                >
                  <div className="mb-2 text-4xl">{medals[index]}</div>
                  <h3 className="mb-1 font-bold text-gray-900">{entry.student.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">{entry.voteCount}</p>
                  <p className="text-sm text-gray-600">
                    {entry.voteCount === 1 ? 'vote' : 'votes'}
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
        <div className="mt-8 rounded-lg border bg-blue-50 p-6 text-center">
          <p className="text-sm text-gray-700">
            💡 <strong>Tip:</strong> Share the contest with your friends and ask them to vote for
            you!
          </p>
        </div>
      )}
    </div>
  )
}

