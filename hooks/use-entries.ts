import { useState, useEffect } from 'react'

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

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/entries')
      if (!response.ok) throw new Error('Failed to fetch entries')
      const data = await response.json()
      setEntries(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return { entries, loading, error, refetch: fetchEntries }
}

