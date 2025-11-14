'use client'

import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  entryId: string
  initialVoteCount: number
  hasVoted: boolean
  onVote: (entryId: string) => Promise<void>
  disabled?: boolean
}

export function VoteButton({
  entryId,
  initialVoteCount,
  hasVoted,
  onVote,
  disabled = false,
}: VoteButtonProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [voted, setVoted] = useState(hasVoted)
  const [loading, setLoading] = useState(false)

  // Sync voted state with hasVoted prop
  useEffect(() => {
    setVoted(hasVoted)
  }, [hasVoted])

  // Sync voteCount with initialVoteCount prop
  useEffect(() => {
    setVoteCount(initialVoteCount)
  }, [initialVoteCount])

  const handleClick = async () => {
    if (loading || disabled) return

    setLoading(true)
    // Optimistic update
    setVoted(!voted)
    setVoteCount(voted ? voteCount - 1 : voteCount + 1)

    try {
      await onVote(entryId)
    } catch (error) {
      // Revert on error
      setVoted(!voted)
      setVoteCount(voted ? voteCount + 1 : voteCount - 1)
      console.error('Vote error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className={cn(
        'flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-all',
        'hover:scale-105 active:scale-95',
        voted
          ? 'bg-vote-active text-white shadow-[0_10px_15px_-3px_var(--vote-active-shadow),0_4px_6px_-4px_var(--vote-active-shadow)]'
          : 'bg-vote-inactive text-gray-700 hover:bg-vote-inactive-hover',
        (loading || disabled) && 'cursor-not-allowed opacity-50'
      )}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          voted && 'fill-current'
        )}
      />
      <span className="text-sm font-semibold">{voteCount}</span>
    </button>
  )
}

