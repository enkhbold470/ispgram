import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export interface Student {
  id: string
  clerkId: string
  studentId: string
  name: string
  email: string
  entry?: {
    id: string
    description: string | null
    photoUrl: string
  } | null
}

export function useStudent() {
  const { user, isLoaded } = useUser()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudent() {
      if (!isLoaded || !user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/student')
        if (response.ok) {
          const data = await response.json()
          setStudent(data)
        }
      } catch (err) {
        console.error('Error fetching student:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [user, isLoaded])

  return { student, loading, isLoaded }
}

