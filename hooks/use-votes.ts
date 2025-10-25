import { useState } from 'react'

export function useVotes() {
  const [voting, setVoting] = useState(false)

  const toggleVote = async (entryId: string) => {
    try {
      setVoting(true)
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to vote')
      }

      return await response.json()
    } catch (err) {
      throw err
    } finally {
      setVoting(false)
    }
  }

  return { toggleVote, voting }
}

