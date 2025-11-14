import { useState, useEffect, useCallback } from 'react'

export interface Entry {
  id: string
  studentId: string
  description: string | null
  photoUrl: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    studentId: string
  }
  votes: Array<{
    id: string
    studentId: string
  }>
  voteCount: number
}

interface UseEntriesOptions {
  sortBy?: 'createdAt' | 'votes'
  initialLimit?: number
}

export function useEntries(options: UseEntriesOptions = {}) {
  const { sortBy = 'createdAt', initialLimit = 12 } = options
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const fetchEntries = useCallback(
    async (cursor?: string | null, append = false) => {
      try {
        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        const params = new URLSearchParams({
          limit: initialLimit.toString(),
          sortBy,
        })
        if (cursor) {
          params.set('cursor', cursor)
        }

        const response = await fetch(`/api/entries?${params.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch entries')
        const data = await response.json()

        if (append) {
          setEntries((prev) => [...prev, ...data.entries])
        } else {
          setEntries(data.entries)
        }

        setNextCursor(data.nextCursor)
        setHasMore(data.hasMore)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [initialLimit, sortBy]
  )

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && nextCursor) {
      fetchEntries(nextCursor, true)
    }
  }, [loadingMore, hasMore, nextCursor, fetchEntries])

  const refetch = useCallback(() => {
    setEntries([])
    setNextCursor(null)
    setHasMore(true)
    fetchEntries(null, false)
  }, [fetchEntries])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return {
    entries,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  }
}

