'use client'

import Image from 'next/image'
import { VoteButton } from './vote-button'
import { cn } from '@/lib/utils'

interface EntryCardProps {
  entry: {
    id: string
    photoUrl: string
    description: string | null
    student: {
      name: string
      studentId: string
    }
    votes: Array<{
      studentId: string
    }>
    voteCount: number
  }
  currentStudentId?: string
  onVote: (entryId: string) => Promise<void>
  showVoteButton?: boolean
  rank?: number
}

export function EntryCard({
  entry,
  currentStudentId,
  onVote,
  showVoteButton = true,
  rank,
}: EntryCardProps) {
  const hasVoted = currentStudentId
    ? entry.votes.some((vote) => vote.studentId === currentStudentId)
    : false

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-lg',
        rank === 1 && 'border-[var(--rank-gold)] ring-2 ring-[var(--rank-gold)]',
        rank === 2 && 'border-[var(--rank-silver)] ring-2 ring-[var(--rank-silver)]',
        rank === 3 && 'border-[var(--rank-bronze)] ring-2 ring-[var(--rank-bronze)]'
      )}
    >
      {rank && rank <= 3 && (
        <div className="absolute left-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
          <span className="text-2xl">{getRankEmoji(rank)}</span>
        </div>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        <Image
          src={entry.photoUrl || 'https://placekeanu.com/500'}
          alt={`${entry.student.name}'s Education Week highlight`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{entry.student.name}</h3>
            {entry.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {entry.description}
              </p>
            )}
          </div>
        </div>

        {showVoteButton && (
          <div className="mt-3 flex justify-center">
            <VoteButton
              entryId={entry.id}
              initialVoteCount={entry.voteCount}
              hasVoted={hasVoted}
              onVote={onVote}
            />
          </div>
        )}

        {!showVoteButton && (
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
            <span className="font-semibold">{entry.voteCount}</span>
            <span className="text-sm">votes</span>
          </div>
        )}
      </div>
    </div>
  )
}
