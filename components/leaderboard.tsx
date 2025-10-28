'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trophy } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  photoUrl: string
  description: string | null
  student: {
    name: string
    studentId: string
  }
  voteCount: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const sortedEntries = [...entries].sort((a, b) => b.voteCount - a.voteCount)

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return { emoji: '🥇', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
      case 2:
        return { emoji: '🥈', color: 'text-gray-600 bg-gray-50 border-gray-200' }
      case 3:
        return { emoji: '🥉', color: 'text-orange-600 bg-orange-50 border-orange-200' }
      default:
        return { emoji: `#${rank}`, color: 'text-gray-600 bg-white border-gray-200' }
    }
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <Trophy className="mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No Entries Yet</h3>
        <p className="text-gray-600">Be the first to share your Education Week highlight!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry, index) => {
        const rank = index + 1
        const { emoji, color } = getRankDisplay(rank)

        return (
          <Link
            key={entry.id}
            href={`/post/${entry.id}`}
            className={`flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer ${color}`}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-white font-bold">
              <span className="text-xl">{emoji}</span>
            </div>


            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="font-semibold text-gray-900 line-clamp-1">
                {entry.student.name}
              </h3>
              {entry.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {entry.description}
                </p>
              )}
            </div>

            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={entry.photoUrl || 'https://placekeanu.com/500'}
                alt={`${entry.student.name}'s Education Week highlight`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold text-gray-900">
                {entry.voteCount}
              </span>
              <span className="text-xs text-gray-600">
                {entry.voteCount === 1 ? 'like' : 'likes'}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
